import * as inquirer from "inquirer";

import { Main_Commends } from "./MainCommends";
import * as process from "node:process";

enum MainCommends {
	Managers = "Managers",
	AddManager = "Add new manager",
	ManagerModify = "Modify manager",
	DeleteOneManager = "Delete one manager",
	PurgeManagers = "Delete all managers",
	Quit = "Quit",
}

export function promptUser(): void {
	console.clear();
	inquirer
		.prompt({
			type: "list",
			name: "Maincommand",
			message: "Options Managers",
			choices: Object.values(MainCommends),
		})
		.then((answers: any) => {
			switch (answers["Maincommand"]) {
				case MainCommends.Managers:
					Main_Commends.displiyManagaers();
					break;
				case MainCommends.AddManager:
					Main_Commends.AddManager();
					break;
				case MainCommends.ManagerModify:
					Main_Commends.modifyManager();
					break;
				case MainCommends.DeleteOneManager:
					Main_Commends.deleteOneManager();
					break;
				case MainCommends.PurgeManagers:
					Main_Commends.deleteAllManager();
					break;
				case MainCommends.Quit:
					// this case must be set to exit
					break;
			}
		});
}

promptUser();
