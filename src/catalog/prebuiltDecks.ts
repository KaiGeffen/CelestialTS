const decks = {
	Anubis : "21:20:20:17:17:14:14:6:3:3:3:3:0:0:0",
	Robots : "22:22:15:10:11:11:8:8:8:4:4:2:2:2:2",
	Stalker : "23:20:19:19:19:19:13:11:12:1:1:1:1:1:1",
	Lord: "62:44:20:20:57:11:11:11:69:69:69:63:63:0:0",
	Bastet : "71:71:11:11:11:11:34:32:28:28:28:28:0:0:0",
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
