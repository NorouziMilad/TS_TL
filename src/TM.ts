export class Tasks {
	id: number;
	task: string;
	complete: boolean = false;
	managerId: number;
	
	constructor(id: number, task: string, managerId: number) {
		this.id = id;
		this.task = task;
		this.managerId = managerId;
	}
}

export class Manager {
	id: number;
	name: string;
	tasks: Tasks[];

	constructor(id: number, name: string, tasks: Tasks[]) {
		this.id = id;
		this.name = name;
		this.tasks = tasks;
	}
}
