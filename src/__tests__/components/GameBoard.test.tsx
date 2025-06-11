import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameBoard from '../../components/GameBoard';
import { GameState, TileType, EntityType, GameTheme } from '../../types/game';

describe('GameBoard', () => {
  // моковое состояние игры
  const mockGameState: GameState = {
    player: {
      id: 'player',
      type: EntityType.PLAYER,
      name: 'Player',
      position: { x: 1, y: 1 },
      stats: { health: 100, maxHealth: 100, attack: 10, defense: 5, experience: 0, level: 1, experienceToNextLevel: 100 },
      symbol: '🤡',
    },
    enemies: [
      {
        id: 'enemy-1',
        name: 'Goblin Warrior',
        type: EntityType.ENEMY,
        position: { x: 3, y: 2 },
        stats: { health: 20, maxHealth: 20, attack: 5, defense: 1, experience: 0, level: 1, experienceToNextLevel: 0 },
        symbol: '👺',
        experience: 10
      },
    ],
    currentField: {
      width: 30,
      height: 30,
      position: { x: 0, y: 0 },
      tiles: [], // будет инициализировано в beforeEach
    },
    map: {
      width: 11,
      height: 11,
      fields: [], // будет содержать currentField
    },
    turn: 1,
    gameOver: false,
    victory: false,
    theme: GameTheme.FANTASY,
    replicatingEntities: [],
  };

  beforeEach(() => {
    // заполнение mockGameState.currentField.tiles перед каждым тестом
    mockGameState.currentField.tiles = Array(mockGameState.currentField.height).fill(null).map((_, y) =>
      Array(mockGameState.currentField.width).fill(null).map((__, x) => ({
        position: { x, y },
        type: TileType.FIELD,
        entity: null,
      }))
    );

    // размещение игрока и врага на моковой карте
    mockGameState.currentField.tiles[mockGameState.player.position.y][mockGameState.player.position.x].entity = mockGameState.player;
    mockGameState.currentField.tiles[mockGameState.enemies[0].position.y][mockGameState.enemies[0].position.x].entity = mockGameState.enemies[0];
  
    mockGameState.map = {
      width: 11,
      height: 11,
      fields: [[mockGameState.currentField]],
    };
});

  it('should render the game board with correct dimensions', () => {
    render(<GameBoard gameState={mockGameState} />);
    const gameBoardElement = screen.getByRole('grid');

    expect(gameBoardElement).toBeInTheDocument();
    // проверка CSS-свойства, которые зависят от ширины/высоты карты
    expect(gameBoardElement).toHaveStyle(`grid-template-columns: repeat(${mockGameState.currentField.width}, 1fr)`);
    expect(gameBoardElement).toHaveStyle(`grid-template-rows: repeat(${mockGameState.currentField.height}, 1fr)`);
  });

  it('should render player character at correct position', () => {
    render(<GameBoard gameState={mockGameState} />);
    const playerTile = screen.getByText(mockGameState.player.symbol);
    
    expect(playerTile).toBeInTheDocument();
    expect(playerTile).toHaveClass('tile');
    expect(playerTile).toHaveClass('entity');
    expect(playerTile).toHaveClass('player');
    expect(playerTile).toHaveAttribute('title', mockGameState.player.name);
  });

  it('should render enemy character at correct position', () => {
    render(<GameBoard gameState={mockGameState} />);
    const enemyTile = screen.getByText(mockGameState.enemies[0].symbol);

    expect(enemyTile).toBeInTheDocument();
    expect(enemyTile).toHaveClass('tile');
    expect(enemyTile).toHaveClass('entity');
    expect(enemyTile).toHaveClass('enemy');
    expect(enemyTile).toHaveAttribute('title', mockGameState.enemies[0].name);
  });

  it('should render different tile types with corresponding CSS classes and content', () => {
    // изменение нескольких тайлов для этого теста
    mockGameState.currentField.tiles[0][0].type = TileType.WALL;
    mockGameState.currentField.tiles[0][1].type = TileType.MOUNTAIN;
    mockGameState.currentField.tiles[0][2].type = TileType.RIVER;
    mockGameState.currentField.tiles[0][3].type = TileType.EXIT_UP;
    mockGameState.currentField.tiles[0][4].type = TileType.NO_WAY;

    render(<GameBoard gameState={mockGameState} />);

    // проверка WALL (без специального символа)
    const wallTile = screen.getAllByTitle(TileType.WALL)[0]; // получаем первый элемент с этим title
    expect(wallTile).toHaveClass('wall');
    expect(wallTile).not.toHaveTextContent(' '); // пусто, если нет сущности

    // проверка MOUNTAIN
    const mountainTile = screen.getByTitle(TileType.MOUNTAIN);
    expect(mountainTile).toHaveClass('mountain');
    expect(mountainTile).toHaveTextContent('⛰️');

    // проверка RIVER
    const riverTile = screen.getByTitle(TileType.RIVER);
    expect(riverTile).toHaveClass('river');
    expect(riverTile).toHaveTextContent('🌊');

    // провкрка EXIT_UP
    const exitUpTile = screen.getByTitle(TileType.EXIT_UP);
    expect(exitUpTile).toHaveClass('exit-up');
    expect(exitUpTile).toHaveTextContent('🔼');

    // проверка NO_WAY
    const noWayTile = screen.getByTitle(TileType.NO_WAY);
    expect(noWayTile).toHaveClass('no-way');
    expect(noWayTile).toHaveTextContent('❌');
  });
});