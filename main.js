(function () {
    // declare dom elements
    const field = document.getElementById('field');
    let finishElement,
        level,
        player,
        nearestBarrier,
        nearestBarrierIndex;

    // declare config objects
    const fieldConfig = {
        height: 280,
        groundHeight: 63
    };

    const playerConfig = {
        width: 40,
        height: 40
    };

    const levelConfig = {
        layout: '........|........|........|........|............|........|.............|.......|........|........|........|............|.....f',
        levelHeight: 60,
        elemWidth: 30,
        elemHeight: 70,
        // higher value of transitionTimeForOneBlock sets slower game. 100 is medium value
        transitionTimeForOneBlock: 100
    };

    const images = {
        player: 'url("img/player.png")',
        playerWon: 'url("img/player.png")',
        playerLost: 'url("img/player.png")',
    };

    // declare other variables
    let barriers,
        barriersLength,
        levelWidthStyle,
        interval,
        jumpTimeout;

    // jump time in 'ms'
    const jumpTime = levelConfig.transitionTimeForOneBlock * 3;
    // jump hight in 'px'
    const jumpPower = 170;
    // interval for calling checkGameState, which checks for collisions, finish, etc
    const checkGameStateInterval = 40;

    const setField = () => {
        field.style.height = `${fieldConfig.height}px`;
    };

    const getClassNameByBlockType = (blockType) => {
        let blockClassName;
            switch (blockType) {
                case '|':
                    blockClassName = 'barrier';
                    break;
                case '.':
                    blockClassName = 'empty';
                    break;
                case 'f':
                    blockClassName = 'finish';
                    break;
                default:
                    blockClassName = 'empty';
                    break;
            }
        return blockClassName;
    };

    const createLevelLayout = () => {
        level = document.createElement('div');
        level.classList.add('level');
        levelWidthStyle = `${(levelConfig.layout.length * levelConfig.elemWidth)}px`;
        level.style.width = levelWidthStyle;
        level.style.height = `${levelConfig.levelHeight}px`;
        level.style.bottom = `${fieldConfig.groundHeight}px`;

        // add blocks to level
        levelConfig.layout.split('').map(blockType => {
            const elem = document.createElement('div');
            const blockClassName = getClassNameByBlockType(blockType);
            elem.classList.add(blockClassName);
            elem.style.width = `${blockClassName === 'finish' ? 100 : levelConfig.elemWidth}px`;
            elem.style.height = `${levelConfig.elemheight}px`;
            level.appendChild(elem);
        });

        field.appendChild(level);

        // set barriers and finish
        barriers = document.getElementsByClassName('barrier');
        barriersLength = barriers.length;
        finishElement = document.getElementsByClassName('finish')[0];
    };

    const isLevelCompleted = (playerXPosition, finishXPosition) => {
        return (finishXPosition - playerXPosition) <= 30;
    };

    const finishGame = (isSuccess) => {
        clearInterval(interval);
        clearTimeout(jumpTimeout);

        level.style.marginLeft = getComputedStyle(level).marginLeft;
        player.style.backgroundImage = isSuccess ? images.playerWon : images.playerLost;
        player.style.bottom = getComputedStyle(player).bottom;

        // stop slide animation of background
        field.style.animation = 'none';

        removeJumpListeners();
        addRestartListeners();
    };

    const checkGameState = () => {
        const playerPosition = player.getBoundingClientRect();
        const finishPosition = finishElement.getBoundingClientRect();

        // check for game finish
        if (isLevelCompleted(playerPosition.x, finishPosition.x)) {
            finishGame(true);
        }

        // set initial nearest barrier index
        if (!nearestBarrier) {
            nearestBarrierIndex = 0;
        }

        // return if all barriers passed
        if (nearestBarrierIndex === barriersLength) {
            return;
        }

        nearestBarrier = barriers[nearestBarrierIndex];
        nearestBarrierPosition = nearestBarrier.getBoundingClientRect();

        // if block passed - set next barrier
        if (playerPosition.x > nearestBarrierPosition.x + levelConfig.elemWidth) {
            nearestBarrierIndex += 1;
            return;
        }

        // finish game if collision happens
        if (playerPosition.x + playerConfig.width >= nearestBarrierPosition.x && playerPosition.bottom >= nearestBarrierPosition.top) {
            // finishGame(false);
        }
    };

    const startGame = () => {
        level.style.marginLeft = `-${levelWidthStyle}`;
        level.style.transition = `margin-left ${levelConfig.transitionTimeForOneBlock * levelConfig.layout.length}ms linear`;

        // start slide animation of background
        field.style.animation = 'slideBackground 40s linear infinite';

        removeStartGameListeners();
        addJumpListeners();

        // check game state every %checkGameStateInterval%
        interval = setInterval(checkGameState, checkGameStateInterval);
    };

    const jump = (event) => {
        if (event.type === 'keydown' && (event.code !== 'Space' && event.code !== 'ArrowUp' && event.code !== 'Enter')) {
            return;
        }
        const playerPosition = player.getBoundingClientRect();
        const levelPosition = level.getBoundingClientRect();

        // prevent jump when jump in progress
        if (playerPosition.bottom < levelPosition.bottom) {
            return;
        }

        player.style.bottom = `${jumpPower + fieldConfig.groundHeight}px`;
        jumpTimeout = setTimeout(() => {
            player.style.bottom = `${fieldConfig.groundHeight}px`;
        }, jumpTime);
    };

    const createPlayer = (config) => {
        player = document.createElement('div');
        player.classList.add('player');
        player.style.width = `${playerConfig.width}px`;
        player.style.height = `${playerConfig.height}px`;
        player.style.left = `${playerConfig.width}px`;
        player.style.bottom = `${fieldConfig.groundHeight}px`;
        player.style.transition = `bottom ${jumpTime}ms linear`;
        player.style.backgroundImage = images.player;

        field.appendChild(player);
    };

    const addStartGameListeners = () => {
        document.body.addEventListener('click', startGame);
        document.body.addEventListener('keydown', startGame);
    };

    const removeStartGameListeners = () => {
        document.body.removeEventListener('click', startGame);
        document.body.removeEventListener('keydown', startGame);
    };

    const addJumpListeners = () => {
        document.body.addEventListener('click', jump);
        document.body.addEventListener('keydown', jump);
    };

    const removeJumpListeners = () => {
        document.body.removeEventListener('click', jump);
        document.body.removeEventListener('keydown', jump);
    };

    const reload = () => location.reload();

    const addRestartListeners = () => {
        document.body.addEventListener('click', reload);
        document.body.addEventListener('keydown', reload);
    };

    const init = () => {
        setField();
        createLevelLayout();
        createPlayer();
        addStartGameListeners();
    };

    init();
}());
