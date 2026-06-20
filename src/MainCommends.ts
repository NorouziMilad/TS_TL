import * as inquirer from "inquirer";
import { ManagerCollection } from "./MC";

import { promptUser } from ".";
import { Sub_Commends } from "./SubCommends";
const initdb = new ManagerCollection([]);
export class Main_Commends {
	static AddManager() {
		console.clear();
		const result = (i: string): boolean | number => {
			return initdb.ChackManager(i, true);
		};
		inquirer
			.prompt({
				type: "input",
				name: "add_manager",
				message: "Enter manager name:",
				validate: function (i) {
					if (i === "") return console.log("\nplease enter your name");
					if (result(i)) return console.log("\nthis name already exist :)");
					return true;
				},
			})
			.then((answer) => {
				initdb.addManager(answer.add_manager);
				promptUser();
			});
	}
	static displiyManagaers() {
		if (initdb.getAllManagers().length === 0) {
			console.clear();
			inquirer
				.prompt({
					type: "input",
					name: "question_init_manager",
					message: "add first manager for continue :)",
					validate: function (i) {
						return i === "" ? console.log("\ninput is empty :(") : true;
					},
				})
				.then((answer) => {
					initdb.addManager(answer.question_init_manager);
					promptUser();
				});
		} else {
			console.clear();
			inquirer
				.prompt({
					type: "list",
					name: "Managers",
					message: "choisce a manager",
					choices: () => {
						return initdb.getAllManagers().filter((m) => m.name);
					},
				})
				.then((answer) => {
					console.clear();
					const { id } = initdb.getSpecialManager(undefined, answer.Managers);
					Sub_Commends.showOptionsTask(id, initdb);
				});
		}
	}
	static modifyManager() {
		console.clear();
		inquirer
			.prompt({
				type: "list",
				name: "selectManager",
				message: "modify manager",
				choices: () => {
					return initdb.getAllManagers().filter((m) => m.name);
				},
			})
			.then((answer) => {
				console.clear();
				const { id } = initdb.getSpecialManager(undefined, answer.selectManager);
				inquirer
					.prompt({
						type: "input",
						name: "modifyManager",
						message: "modify manager",
						validate: (i) => {
							return i === "" ? console.log("\ninput is empty!") : true;
						},
					})
					.then((answer) => {
						initdb.modifiyManager(id, answer.modifyManager)
							? promptUser()
							: (this.modifyManager(), console.log("\nthis name has ben selected already!"));
					});
			});
	}
	static deleteOneManager() {
		console.clear();
		inquirer
			.prompt({
				type: "list",
				name: "Managers",
				message: "choisce a manager",
				choices: () => {
					return initdb.getAllManagers().filter((m) => m.name);
				},
			})
			.then((answer) => {
				const { id } = initdb.getSpecialManager(undefined, answer.Managers);
				initdb.deleteOneManager(id);
				promptUser();
			});
	}
	static deleteAllManager() {
		initdb.deleteAllManagers();
		promptUser();
	}
}
 