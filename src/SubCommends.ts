import * as inquirer from "inquirer";

import { promptUser } from ".";

enum SubCommends {
	Tasks = "Tasks",
	AddTask = "Add new task",
	DeleteAllTasks = "Delete all tasks",
	Toggle = "Show/Hide completed",
	back = "< back To Managers",
}

enum SubOptions {
	TaskModify = "Modify",
	Completed = "Complete",
	DeleteOneTask = "Delete",
	back = "< Back To Task Options",
}

export class Sub_Commends {
	static displiyTasks(managerId: number, process: any, filterComplete: boolean) {
		console.clear();
		const result = process.infoManager(managerId);
		if (result.allTasks.length > 0) {
			inquirer
				.prompt({
					type: "list",
					name: "infoManager",
					message: `${result.name} have ${filterComplete ? result.completeTasks.length : result.allTasks.length} tasks (${filterComplete ? "completed" : "all"})`,
					choices: filterComplete
						? result.completeTasks.map((t) => t.task)
						: result.allTasks.map((t) => t.task),
				})
				.then((answer) => {
					console.clear();
					this.showSubOptions(managerId, answer.infoManager, process, result.name);
				});
		} else {
			(console.clear(),
				inquirer
					.prompt({
						type: "input",
						name: "add_task",
						message: "List is empty!\nStart your first Task (name):",
						validate: function (i) {
							if (i === "") return console.log("\nplease enter your name");
							if (process.ChackTask(result.id, i, true))
								return console.log("\nthis name already exist :)");
							return true;
						},
					})
					.then((answer) => {
						process.addTask(result.id, answer.add_task);
						this.showOptionsTask(result.id, process);
					}));
		}
	}

	static addTasks(managerId: number, process) {
		console.clear();
		inquirer
			.prompt({
				type: "input",
				name: "add_task",
				message: "Enter task name:",
				validate: function (i) {
					if (i === "") return console.log("\nplease enter your name");
					if (process.ChackTask(managerId, i, true))
						return console.log("\nthis name already exist :)");
					return true;
				},
			})
			.then((answer) => {
				process.addTask(managerId, answer.add_task);
				this.showOptionsTask(managerId, process);
			});
	}

	static showOptionsTask(managerId: number, process: any) {
		console.clear();
		const result = process.getSpecialManager(managerId);

		inquirer
			.prompt({
				type: "list",
				name: "subCommands",
				message: `Task Options(${result.name})`,
				choices: Object.values(SubCommends),
			})
			.then((answers) => {
				switch (answers.subCommands) {
					case SubCommends.AddTask:
						this.addTasks(managerId, process);
						break;
					case SubCommends.Tasks:
						this.displiyTasks(managerId, process, false);
						break;
					case SubCommends.DeleteAllTasks:
						this.deleteAllTasks(managerId, process);
						break;
					case SubCommends.Toggle:
						this.displiyTasks(managerId, process, true);
						break;
					case SubCommends.back:
						promptUser();
						break;
				}
			});
	}
	static showSubOptions(managerId: number, name: string, process: any, nameM: string) {
		console.clear();
		const { id, task, complete } = process.getSpecialTask(managerId, undefined, name);

		inquirer
			.prompt({
				type: "list",
				name: "subOptions",
				message: `task:${task} complete:${complete} (${nameM})`,
				choices: Object.values(SubOptions),
			})
			.then((answers) => {
				switch (answers.subOptions) {
					case SubOptions.Completed:
						this.switchComplete(managerId, id, complete, process);
						break;
					case SubOptions.DeleteOneTask:
						this.deleteOnetask(id, managerId, process);
						break;
					case SubOptions.TaskModify:
						this.modifyTask(id, managerId, process);
						break;
					case SubOptions.back:
						this.showOptionsTask(managerId, process);
						break;
				}
			});
	}

	static modifyTask(id: number, managerId: number, process: any) {
		console.clear();
		inquirer
			.prompt({
				type: "input",
				name: "TaskNewName",
				message: "Enter new name:",
				validate: (i) => {
					return i === "" ? console.log("\nplease enter your name") : true;
				},
			})
			.then((answer) => {
				const nameManeger = process.getSpecialManager(managerId);
				const result = process.modifyTask(managerId, id, answer.TaskNewName);
				result
					? this.showSubOptions(managerId, answer.TaskNewName, process, nameManeger.name)
					: (this.showSubOptions(managerId, answer.TaskNewName, process, nameManeger.name),
						console.log("\nError: this name selected already!"));
			});
	}

	static switchComplete(managerId: number, id: number, status: boolean, process: any) {
		const getTask = process.getSpecialTask(managerId, id, undefined);
		const nameManeger = process.getSpecialManager(managerId);

		process.SwitchTaskComplete(managerId, id, status ? false : true);
		this.showSubOptions(managerId, getTask.task, process, nameManeger.name);
	}

	static deleteOnetask(id: number, managerId: number, process: any) {
		process.deleteOneTask(id, managerId);
		this.showOptionsTask(managerId, process);
	}

	static deleteAllTasks(managerId: number, prosess: any): void {
		prosess.deleteAllTasks(managerId);
		this.showOptionsTask(managerId, prosess);
	}
}
