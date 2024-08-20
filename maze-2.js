window.initGame = (React, assetsUrl) => {
    const { useState, useEffect, useRef, useMemo } = React;
    const { useLoader, useThree, useFrame } = window.ReactThreeFiber;
    const THREE = window.THREE;
    const { GLTFLoader } = window.THREE;

    // ... (Existing code for CardModel, TableModel, Table2Model, BooModel, ChairModel, TextModel, Card, RotatingModel, Camera, HandModel, Hand) ...

    function Maze() {
        const [playerPosition, setPlayerPosition] = useState([0, 0, 0]);
        const [mazeData, setMazeData] = useState([
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ]);
        const [isGameOver, setIsGameOver] = useState(false);
        const [isGameWon, setIsGameWon] = useState(false);

        const mazeRef = useRef();
        const playerRef = useRef();
        const { camera, mouse } = useThree();

        useEffect(() => {
            // Set initial player position (start of the maze)
            setPlayerPosition([1, 0, 0]);
        }, []);

        const handleKeyDown = (event) => {
            if (isGameOver || isGameWon) return;

            const currentX = playerPosition[0];
            const currentY = playerPosition[1];
            const currentZ = playerPosition[2];

            let newX = currentX;
            let newZ = currentZ;

            if (event.key === 'ArrowUp') {
                newZ = currentZ - 1;
            } else if (event.key === 'ArrowDown') {
                newZ = currentZ + 1;
            } else if (event.key === 'ArrowLeft') {
                newX = currentX - 1;
            } else if (event.key === 'ArrowRight') {
                newX = currentX + 1;
            }

            // Check if the new position is valid (not a wall)
            if (newX >= 0 && newX < mazeData[0].length &&
                newZ >= 0 && newZ < mazeData.length &&
                mazeData[newZ][newX] === 0) {
                setPlayerPosition([newX, currentY, newZ]);

                // Check if the player reached the end of the maze
                if (newX === 9 && newZ === 5) {
                    setIsGameWon(true);
                    setIsGameOver(true);
                }
            }
        };

        useEffect(() => {
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }, [handleKeyDown]);

        // Function to create maze walls
        const createMazeWalls = () => {
            const walls = [];
            for (let z = 0; z < mazeData.length; z++) {
                for (let x = 0; x < mazeData[0].length; x++) {
                    if (mazeData[z][x] === 1) {
                        walls.push(
                            React.createElement('mesh', {
                                key: `${x}-${z}`,
                                position: [x, 0, z],
                                geometry: new THREE.BoxGeometry(1, 1, 1),
                                material: new THREE.MeshBasicMaterial({ color: 'gray' }),
                            })
                        );
                    }
                }
            }
            return walls;
        };

        // Function to create the player
        const createPlayer = () => {
            return React.createElement(
                'mesh',
                {
                    ref: playerRef,
                    position: playerPosition,
                    geometry: new THREE.BoxGeometry(0.5, 0.5, 0.5),
                    material: new THREE.MeshBasicMaterial({ color: 'red' }),
                }
            );
        };

        // Function to create the end point
        const createEndPoint = () => {
            return React.createElement(
                'mesh',
                {
                    position: [9, 0, 5],
                    geometry: new THREE.BoxGeometry(0.5, 0.5, 0.5),
                    material: new THREE.MeshBasicMaterial({ color: 'green' }),
                }
            );
        };

        // Function to handle camera movement
        const handleCameraMovement = () => {
            useFrame((state) => {
                if (playerRef.current) {
                    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
                    vector.unproject(camera);
                    const dir = vector.sub(camera.position).normalize();
                    const distance = -camera.position.z / dir.z;
                    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
                    camera.position.copy(pos);
                    camera.lookAt(playerRef.current.position);
                }
            });
        };

        return React.createElement(
            React.Fragment,
            null,
            React.createElement(Camera),
            React.createElement('ambientLight', { intensity: 0.5 }),
            React.createElement('pointLight', { position: [10, 10, 10] }),
            React.createElement(
                'group',
                { ref: mazeRef },
                createMazeWalls(),
                createPlayer(),
                createEndPoint()
            ),
            handleCameraMovement(),
            isGameOver && React.createElement(
                'group',
                { position: [5, 2, 2] },
                React.createElement('mesh', {
                    geometry: new THREE.PlaneGeometry(5, 2),
                    material: new THREE.MeshBasicMaterial({ color: 'white', transparent: true, opacity: 0.8 }),
                }),
                React.createElement('text', {
                    position: [0, 0.5, 0],
                    fontSize: 0.5,
                    color: 'black',
                    textAlign: 'center',
                }, isGameWon ? 'You Won!' : 'Game Over')
            )
        );
    }

    return Maze;
};

console.log('Maze game script loaded');