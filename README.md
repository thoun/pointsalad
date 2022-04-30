# What is this project ? 
This project is an adaptation for BoardGameArena of game Point Salad edited by Alderac Entertainment Group.
You can play here : https://boardgamearena.com

# How to install the auto-build stack

## Install builders
Intall node/npm then `npm i` on the root folder to get builders.

## Auto build JS and CSS files
In VS Code, add extension https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave and then add to config.json extension part :
```json
        "commands": [
            {
                "match": ".*\\.ts$",
                "isAsync": true,
                "cmd": "npm run build:ts"
            },
            {
                "match": ".*\\.scss$",
                "isAsync": true,
                "cmd": "npm run build:scss"
            }
        ]
    }
```
If you use it for another game, replace `pointsalad` mentions on package.json `build:scss` script and on tsconfig.json `files` property.

## Auto-upload builded files
Also add one auto-FTP upload extension (for example https://marketplace.visualstudio.com/items?itemName=lukasz-wronski.ftp-sync) and configure it. The extension will detected modified files in the workspace, including builded ones, and upload them to remote server.

## Hint
Make sure ftp-sync.json and node_modules are in .gitignore

# Font
Font on cards seems to be Hoolister, only free for personal use.
Similar free font used : https://www.1001freefonts.com/kosugi-maru.font

## To replay notifs from a replay

JSON.stringify(
    [].concat(
        ...g_gamelogs.map(log => log.data).filter(notifs => notifs.some(notif => ['takenCards', 'flippedCard', 'marketRefill', 'pileRefill'].includes(notif.type))).map(notifs => notifs.filter(notif => ['takenCards', 'flippedCard', 'marketRefill', 'pileRefill'].includes(notif.type)))
    )
)
.replaceAll('28679657', '2343492')
.replaceAll('85476842', '2343493')
.replaceAll('85267018', '2343494')

// temp1 is a stored variable, $_ is last console input
JSON.parse(temp1).forEach((notif, notifIndex) => setTimeout(() => gameui['notif_' + notif.type](notif), notifIndex * 600))
