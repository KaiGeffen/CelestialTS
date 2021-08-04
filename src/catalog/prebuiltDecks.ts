const decks = {
	Anubis : "21:20:20:14:14:14:14:3:3:3:3:3:0:0:0",
	Robots : "22:22:15:10:12:12:8:8:3:3:2:2:2:2:0",
	Stalker : "23:20:19:19:19:19:13:11:12:1:1:1:1:1:1",
	Crypt : "20:19:19:19:15:12:12:36:36:36:35:1:1:1:0",
	Bastet : "11:11:11:11:34:34:34:33:33:33:3:3:28:28:0",
	Horus : "45:45:13:13:11:39:39:32:31:31:28:27:27:27:27"
}

export default class PrebuiltDecks {
	// Get the prebuilt deck with the given name
	static get(name: string): string {
		return decks[name]
	}

	static getAll(): Record<string, string> {
		return decks
	}
}
