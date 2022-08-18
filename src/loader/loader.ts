import avatarNames from '../lib/avatarNames'
import { allCards, collectibleCards } from '../catalog/catalog'

// Json data
import avatarData from './avatars.json'
import iconData from './icons.json'
import backgroundData from './backgrounds.json'
import keywordData from './keywords.json'
import sfxData from './sfx.json'
import voiceData from './voice.json'
import { Space } from '../settings/settings'


// Entry in the prefix map below
interface PrefixEntry {
	fp: string,
	prefix: string,
	list: string[],
}

const prefixMap: PrefixEntry[] = [
	{
		fp: 'avatars/',
		prefix: 'avatar-',
		list: avatarData,
	},
	{
		fp: 'backgrounds/',
		prefix: 'bg-',
		list: backgroundData,
	},
	{
		fp: 'cards/',
		prefix: '',
		list: allCards.map((card) => card.name),
	},
	{
		fp: 'cutouts/',
		prefix: 'cutout-',
		list: collectibleCards.map((card) => card.name),
	},
	{
		fp: 'icons/',
		prefix: 'icon-',
		list: iconData,
	},
	{
		fp: 'keywords/',
		prefix: 'kw-',
		list: keywordData,
	},
]


export default class Loader {
	static loadAll(scene) {
		// Set the load path
		scene.load.path = 'assets/'

		// Load the avatars as a spritesheet
		Loader.loadAvatarPortraits(scene)

		// Load button as a spritesheet
		Loader.loadButton(scene)

		// Load all audio
		Loader.loadAudio(scene)

		// Load the videos
		Loader.loadVideos(scene)

		// Load the round results
		Loader.loadResults(scene)

		// Load the rest of the assets
		Loader.bulkLoad(scene)
	}

	// Load all of the assets that load in a normal way
	private static bulkLoad(scene): void {
		// For each type of asset
		prefixMap.forEach((assetType: PrefixEntry) => {

			// For each asset of that type
			assetType.list.forEach((name) => {
				scene.load.image(`${assetType.prefix}${name}`, `${assetType.fp}${name}.png`)
			})			
		})
	}

	// Loads the avatar portraits which are spritesheets
	private static loadAvatarPortraits(scene): void {
		avatarNames.forEach((name) => {
			// Load the spritesheet with basic + emotes
			scene.load.spritesheet(`avatar-${name}`, `avatars/${name}.png`, {
				frameWidth: Space.avatarSize,
				frameHeight: Space.avatarSize,
			})
		})
	}

	// Loads the basic button as a spritesheet
	private static loadButton(scene): void {
		scene.load.spritesheet(`icon-Button`, `icons/Button.png`, {
			frameWidth: Space.smallButtonWidth,
			frameHeight: Space.smallButtonHeight + 8, // 8 From dropshadow
		})
	}

	// Loads all audio
	private static loadAudio(scene): void {
		// Load all sfx
		sfxData.forEach((sound) => {
			scene.load.audio(sound, `sfx/${sound}.mp3`)
		})

		// Load each characters voice clip
		voiceData.forEach((name) => {
			scene.load.audio(`voice-${name}`, `voice/${name}.mp3`)
		})
	}

	// Loads all video textures
	private static loadVideos(scene): void {
		// scene.load.video('priorityHighlight', 'priority.mp4')
	}

	// Load the round result animations
	private static loadResults(scene: Phaser.Scene): void {
		['Win', 'Lose', 'Tie'].forEach(s => {
			const name = `icon-Round${s}`

			scene.load.spritesheet(name, `icons/Round${s}.png`, {
				frameWidth: 563,
				frameHeight: 258,
			})
		})

		
	}

	// TODO Group these events that happen after loading is complete
	static loadAnimations(scene: Phaser.Scene): void {
		['Win', 'Lose', 'Tie'].forEach(s => {
			const name = `icon-Round${s}`

			scene.anims.create({
				key: name,
				frameRate: 1,
				frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 3 }),
				repeat: -1,
			})
		})
	}
}
