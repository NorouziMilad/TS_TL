type scimaManager = {
	managers: [
		{
			id: number;
			name: string;
			tasks: {
				id: number;
				task: string;
				complete: boolean;
				managerId: number;
			}[];
			tCount: number;
		},
	];
	mCount: number;
};
