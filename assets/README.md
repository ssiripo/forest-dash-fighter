# Assets

The supplied character sheet has been copied here as:

`fawad-character-sheet.jpg`

Additional selectable characters from the latest zip are in:

`characters/`

To add another character, put the image in `assets/characters/` and add a new
entry to `CHARACTER_ROSTER` near the top of `game.js`.

If the sprite appears offset in-game, assign it to the closest crop preset in
`game.js`: `DEFAULT_SPRITE_FRAMES`, `SHORT_SPRITE_FRAMES`,
`WIDE_SPRITE_FRAMES`, or `TALL_SPRITE_FRAMES`.

Optional audio placeholders can be added later:

- `audio/jump.wav`
- `audio/attack.wav`
- `audio/hit.wav`
- `audio/item.wav`
- `audio/finish.wav`
- `audio/music.mp3`

The game keeps running if these audio files are missing.
