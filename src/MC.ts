import { Manager, Tasks } from "./TM";

import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";

export class ManagerCollection {
	private nextManagerId: number = 1;
	private nextTaskId: number = 1;
	protected db: LowSync<scimaManager>;

	constructor(manager: Manager[]) {
		this.db = new LowSync(new JSONFileSync("db.json"), <scimaManager>{
			managers: manager,
			mCount: manager.length,
		});

		this.db.adapter.read()
			? this.db.adapter.read().mCount === 0 && this.db.write()
			: this.db.write();
	}

	// *** Adding ***

	addManager(name: string): number {
		if (this.ChackManager(name, true)) {
			console.log("this manager already exist!");
		} else {
			this.nextManagerId = this.getAllManagers().length + 1;
			this.storeManager(this.nextManagerId, name, [], 0);
			return this.nextManagerId;
		}
	}

	addTask(managerId: number, task: string): number {
		if (this.ChackTask(managerId, task, true)) {
			console.log("a task exist already by this name!");
		} else {
			this.nextTaskId = this.getTasks(managerId, true).length + 1;
			this.storeTasks(managerId, [
				{ id: this.nextTaskId, task: task, complete: false, managerId: managerId },
			]);
			return this.nextTaskId;
		}
	}

	// *** Chacking ***

	ChackManager(name: string, stateT: boolean): boolean | number {
		let init: boolean;
		let id: number; // for a process like modify managers
		this.db.adapter.read().managers.find((m) => {
			return m.name === name ? ((init = true), (id = m.id)) : ((init = false), (id = undefined));
		});

		return stateT ? init : id;
	}

	ChackTask(managerId: number, task: string, stateT: boolean): boolean | number {
		let init: boolean;
		let id: number;
		for (let find of this.db.adapter.read().managers.values()) {
			find.id === managerId &&
				find.tasks.find((t) => {
					return t.task === task
						? ((init = true), (id = t.id))
						: ((init = false), (id = undefined));
				});
		}
		return stateT ? init : id;
	}

	// *** Modifing ***

	modifyTask(managerId: number, id: number, task: string): boolean {
		if (this.ChackTask(managerId, task, true) && this.ChackTask(managerId, task, false) !== id) {
			return false;
		} else {
			let processModify = this.db.adapter.read().managers.map((m) => {
				return m.id === managerId
					? { ...m, tasks: m.tasks.map((t) => (t.id === id ? { ...t, task: task } : t)) }
					: m;
			});

			this.db.adapter.write(<scimaManager>{
				managers: processModify,
				mCount: processModify.length,
			});

			return true;
		}
	}

	modifiyManager(id: number, name: string): boolean {
		if (this.ChackManager(name, true) && this.ChackManager(name, false) !== id) {
			return false;
		} else {
			let update = this.db.adapter
				.read()
				.managers.map((m) => (m.id === id ? { ...m, name: name } : m));
			this.db.adapter.write(<scimaManager>{ managers: update });
			return true;
		}
	}

	// *** Switching ***

	SwitchTaskComplete(managerId: number, id: number, stateC: boolean): void {
		let result = this.db.adapter.read().managers.map((m) => {
			return m.id === managerId
				? {
						...m,
						tasks: m.tasks.map((r) => (r.id === id ? { ...r, complete: stateC } : r)),
					}
				: m;
		});

		this.db.adapter.write(<scimaManager>{ managers: result, mCount: result.length });
	}

	// *** Deleting ***

	deleteOneManager(id: number): void {
		const processDeleting = this.db.adapter.read().managers.filter((m) => m.id === id);
		this.db.adapter.write(<scimaManager>{
			managers: processDeleting,
			mCount: processDeleting.length,
		});
	}

	deleteAllManagers(): void {
		this.db.adapter.write(<scimaManager>{
			managers: Object([]),
			mCount: 0,
		});
	}

	deleteOneTask(id: number, managerId: number): void {
		let result = this.db.adapter
			.read()
			.managers.map((m) =>
				m.id === managerId
					? { ...m, tasks: m.tasks.filter((t) => t.id !== id), tCount: m.tasks.length - 1 }
					: m,
			);

		this.db.adapter.write(<scimaManager>{ managers: result });
	}

	deleteAllTasks(id: number): void {
		let result = this.db.adapter
			.read()
			.managers.map((m) => (m.id === id ? { ...m, tasks: [], tCount: 0 } : m));

		this.db.adapter.write(<scimaManager>{ managers: result, mCount: result.length });
	}

	deleteAllCompleteTask(managerId: number, stateDelete: boolean) {
		let result = this.db.adapter
			.read()
			.managers.map((m) =>
				m.id === managerId ? { ...m, tasks: m.tasks.filter((r) => r.complete === stateDelete) } : m,
			);

		this.db.adapter.write(<scimaManager>{ managers: result, mCount: result.length });
	}

	// *** Geting ***

	getAllManagers(): Manager[] {
		return [...this.db.adapter.read().managers.values()];
	}

	getSpecialManager(id?: number, name?: string): Manager {
		for (let findM of this.db.adapter.read().managers.values()) {
			if (findM.id === id) {
				return findM;
			}
			if (findM.name === name) {
				return findM;
			}
		}
	}

	getTasks(managerId: number, includeComplete: boolean): Tasks[] {
		for (let getM of this.getAllManagers()) {
			if (getM.id === managerId) return getM.tasks.filter((t) => includeComplete || !t.complete);
		}
	}

	getSpecialTask(managerId: number, id?: number, name?: string): Tasks {
		for (let findM of this.db.adapter.read().managers.values()) {
			if (findM.id === managerId) {
				for (let findT of findM.tasks) {
					if (findT.task === name) {
						return findT;
					}
					if (findT.id === id) {
						return findT;
					}
				}
			}
		}
	}

	// *** Information ***

	infoManager(id: number) {
		for (let manager of this.getAllManagers().values()) {
			if (manager.id === id) {
				return {
					id: manager.id,
					name: manager.name,
					allTasks: manager.tasks,
					tasksCount: manager.tasks.length,
					completeTasks: manager.tasks.filter((t) => t.complete === true),
					incompleteTasks: manager.tasks.filter((t) => t.complete === false),
				};
			}
		}
	}

	// *** Storing ***

	storeManager(id: number, name: string, tasks: [], tCount: number) {
		let data = [];
		data.push(...this.db.adapter.read().managers.values());
		data.push({
			id: id,
			name: name,
			tasks: tasks,
			tCount: tCount,
		});

		this.db.adapter.write(<scimaManager>{ managers: data, mCount: data.length });
	}

	storeTasks(managerId: number, task: Tasks[]) {
		for (let getManager of this.db.adapter.read().managers.values()) {
			let updatedb = this.db.adapter.read().managers.map((m) => {
				let updateT = [];
				(m.id === managerId && updateT.push(...m.tasks), updateT.push(...task));
				return {
					id: m.id,
					name: m.name,
					tasks: m.id === managerId ? updateT : m.tasks,
					tCount: m.id === managerId ? updateT.length : m.tCount,
				};
			});
			if (getManager.id === managerId && getManager.tasks.length === 0) {
				this.db.adapter.write(<scimaManager>{ managers: updatedb, mCount: updatedb.length });
				break;
			} else if (getManager.id === managerId) {
				this.db.adapter.write(<scimaManager>{ managers: updatedb, mCount: updatedb.length });
				break;
			}
		}
	}
}
