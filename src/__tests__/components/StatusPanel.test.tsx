import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusPanel from '../../components/StatusPanel';
import { GameState, EntityType, GameTheme, EnemyCategory } from '../../types/game';

describe('StatusPanel', () => {
    // моковое состояние игры
  const mockGameState: GameState = {
    player: {
      id: 'player',
      type: EntityType.PLAYER,
      name: 'Player',
      position: { x: 1, y: 1 },
      stats: { health: 75, maxHealth: 100, attack: 12, defense: 6, experience: 50, level: 2, experienceToNextLevel: 200 },
      symbol: '🤡',
    },
    enemies: [
      { id: 'e1', name: 'Goblin', type: EntityType.ENEMY, category: EnemyCategory.MELEE, position: { x: 0, y: 0 }, stats: {} as any, symbol: 'G' },
      { id: 'e2', name: 'Orc', type: EntityType.ENEMY, category: EnemyCategory.MELEE, position: { x: 0, y: 0 }, stats: {} as any, symbol: 'O' },
      { id: 'e3', name: 'Archer', type: EntityType.ENEMY, category: EnemyCategory.RANGED, position: { x: 0, y: 0 }, stats: {} as any, symbol: 'A' },
    ],
    currentField: {} as any, // неважно
    map: {} as any, // неважно
    turn: 15,
    gameOver: false,
    victory: false,
    theme: GameTheme.FANTASY,
    replicatingEntities: [],
  };

  const mockSwitchTheme = jest.fn();
  const mockStartNewGame = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display player stats correctly', () => {
    render(
      <StatusPanel
        gameState={mockGameState}
        switchTheme={mockSwitchTheme}
        isGameRunning={true}
        startNewGame={mockStartNewGame}
      />
    );

    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Health:')).toBeInTheDocument();
    expect(screen.getByText('75/100')).toBeInTheDocument();
    expect(screen.getByText('Level: 2')).toBeInTheDocument();
    expect(screen.getByText('Experience:')).toBeInTheDocument();
    expect(screen.getByText('50/200')).toBeInTheDocument();
    expect(screen.getByText('Attack: 12')).toBeInTheDocument();
    expect(screen.getByText('Defense: 6')).toBeInTheDocument();
  });

  it('should calculate and apply health progress bar width', () => {
    render(
      <StatusPanel
        gameState={mockGameState}
        switchTheme={mockSwitchTheme}
        isGameRunning={true}
        startNewGame={mockStartNewGame}
      />
    );
    const healthProgressBarFill = document.querySelector('.progress-bar-fill.health') as HTMLElement;
    expect(healthProgressBarFill).toHaveStyle('width: 75%');
  });

  it('should calculate and apply experience progress bar width', () => {
    render(
      <StatusPanel
        gameState={mockGameState}
        switchTheme={mockSwitchTheme}
        isGameRunning={true}
        startNewGame={mockStartNewGame}
      />
    );
    const expProgressBarFill = document.querySelector('.progress-bar-fill.exp') as HTMLElement;
    expect(expProgressBarFill).toHaveStyle('width: 25%'); // 50/200 = 0.25
  });

  it('should display current turn number when game is running', () => {
    render(
      <StatusPanel
        gameState={mockGameState}
        switchTheme={mockSwitchTheme}
        isGameRunning={true}
        startNewGame={mockStartNewGame}
      />
    );
    expect(screen.getByText('Turn: 15')).toBeInTheDocument();
    expect(screen.queryByText('Game Over!')).not.toBeInTheDocument();
    expect(screen.queryByText('Victory!')).not.toBeInTheDocument();
  });

  it('should display "Game Over!" when game is over and not victory', () => {
    const gameOverState = { ...mockGameState, gameOver: true, victory: false };
    render(
      <StatusPanel
        gameState={gameOverState}
        switchTheme={mockSwitchTheme}
        isGameRunning={false}
        startNewGame={mockStartNewGame}
      />
    );
    expect(screen.getByText('Game Over!')).toBeInTheDocument();
    expect(screen.queryByText('Turn:')).not.toBeInTheDocument();
  });

  it('should display "Victory!" when game is over and victory', () => {
    const victoryState = { ...mockGameState, gameOver: true, victory: true };
    render(
      <StatusPanel
        gameState={victoryState}
        switchTheme={mockSwitchTheme}
        isGameRunning={false}
        startNewGame={mockStartNewGame}
      />
    );
    expect(screen.getByText('Victory!')).toBeInTheDocument();
    expect(screen.queryByText('Turn:')).not.toBeInTheDocument();
  });

  it('should display enemy counts by category', () => {
    render(
      <StatusPanel
        gameState={mockGameState}
        switchTheme={mockSwitchTheme}
        isGameRunning={true}
        startNewGame={mockStartNewGame}
      />
    );
    expect(screen.getByText(/melee:\s*2/i)).toBeInTheDocument();
    expect(screen.getByText(/ranged:\s*1/i)).toBeInTheDocument();
    expect(screen.getByText(/total:\s*3/i)).toBeInTheDocument();
  });

  it('should show "Start New Game" button when game is not running', () => {
    render(
      <StatusPanel
        gameState={mockGameState}
        switchTheme={mockSwitchTheme}
        isGameRunning={false} // Важно: игра не запущена
        startNewGame={mockStartNewGame}
      />
    );
    const newGameButton = screen.getByRole('button', { name: /start new game/i });
    expect(newGameButton).toBeInTheDocument();
  });

  it('should call startNewGame when the "Start New Game" button is clicked', () => {
    render(
      <StatusPanel
        gameState={mockGameState}
        switchTheme={mockSwitchTheme}
        isGameRunning={false}
        startNewGame={mockStartNewGame}
      />
    );
    const newGameButton = screen.getByRole('button', { name: /start new game/i });
    fireEvent.click(newGameButton);
    expect(mockStartNewGame).toHaveBeenCalledTimes(1);
  });


  it('should display correct theme indicator', () => {
    render(
      <StatusPanel
        gameState={mockGameState}
        switchTheme={mockSwitchTheme}
        isGameRunning={true}
        startNewGame={mockStartNewGame}
      />
    );
    expect(screen.getByText('Theme: FANTASY')).toBeInTheDocument();
  });

  it('should call switchTheme when the theme button is clicked and show correct next theme', () => {
    render(
      <StatusPanel
        gameState={mockGameState}
        switchTheme={mockSwitchTheme}
        isGameRunning={true}
        startNewGame={mockStartNewGame}
      />
    );
    const themeButton = screen.getByRole('button', { name: /switch to forest theme/i });
    expect(themeButton).toBeInTheDocument();
    
    fireEvent.click(themeButton);
    expect(mockSwitchTheme).toHaveBeenCalledTimes(1);

    // Пример для Forest темы
    const forestThemeState = { ...mockGameState, theme: GameTheme.FOREST };
    render(
      <StatusPanel
        gameState={forestThemeState}
        switchTheme={mockSwitchTheme}
        isGameRunning={true}
        startNewGame={mockStartNewGame}
      />
    );
    const themeButtonForest = screen.getByRole('button', { name: /switch to fantasy theme/i });
    expect(themeButtonForest).toBeInTheDocument();
  });
});