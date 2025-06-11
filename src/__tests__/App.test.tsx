import { render, fireEvent, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { GameEngine } from '../services/GameEngine';
import { GameState, GameTheme, EntityType } from '../types/game';
import { CommandInvoker, MoveCommand, WaitCommand } from '../patterns/command/Command';

// моковый GameEngine, так как App взаимодействует с ним
jest.mock('../services/GameEngine');
// моковый CommandInvoker
jest.mock('../patterns/command/Command', () => ({
  ...jest.requireActual('../patterns/command/Command'), // сохраняем оригинальные импорты
  CommandInvoker: jest.fn(() => ({ // мок CommandInvoker
    addCommand: jest.fn(),
    executeCommands: jest.fn(),
  })),
}));

// создание моковой версии GameEngine, чтобы контролировать поведение
const mockGameEngineInstance = {
  getState: jest.fn(),
  movePlayer: jest.fn(),
  processTurn: jest.fn(),
};

// задание стандартного мокового состояния игры
const mockInitialGameState: GameState = {
  player: {
    id: 'player',
      name: 'Player',
      type: EntityType.PLAYER,
      position: { x: 0, y: 0 },
      stats: { health: 100, maxHealth: 100, attack: 10, defense: 5, experience: 0, level: 1, experienceToNextLevel: 100 },
      symbol: '🤡',
  },
  enemies: [],
  currentField: {
			width: 30,
			height: 30,
			position: { x: 0, y: 0 },
			tiles: [],
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
  confusionCooldown: 0
};

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // настраиваем мок GameEngine для возврата начального состояния
    (GameEngine as jest.Mock).mockImplementation(() => mockGameEngineInstance);
    mockGameEngineInstance.getState.mockReturnValue(mockInitialGameState);
  });

  it('should render GameBoard and StatusPanel', () => {
    render(<App />);
    // компоненты рендерятся без ошибок (их детальное содержимое тестируется отдельно)
    expect(screen.getByText('Turn: 1')).toBeInTheDocument(); // из StatusPanel
    expect(screen.getByRole('grid')).toBeInTheDocument(); // из GameBoard
  });

  it('should create a new GameEngine on mount with default theme', () => {
    render(<App />);
    expect(GameEngine).toHaveBeenCalledTimes(1);
    expect(GameEngine).toHaveBeenCalledWith(GameTheme.FANTASY);
  });

  it('should add MoveCommand on "w" key press', () => {
    render(<App />);
		const mockCommandInvoker = (CommandInvoker as jest.Mock).mock.results[0].value;
    act(() => { // используем act, потому что событие keyboard вызывает обновление состояния
      fireEvent.keyDown(window, { key: 'w' });
    });
    expect(mockCommandInvoker.addCommand).toHaveBeenCalledTimes(1);
    expect(mockCommandInvoker.addCommand.mock.calls[0][0]).toBeInstanceOf(MoveCommand);
    expect(mockCommandInvoker.executeCommands).toHaveBeenCalledTimes(1);
  });

  it('should add MoveCommand on ArrowUp key press', () => {
    render(<App />);
		const mockCommandInvoker = (CommandInvoker as jest.Mock).mock.results[0].value;
    act(() => {
      fireEvent.keyDown(window, { key: 'ArrowUp' });
    });
    expect(mockCommandInvoker.addCommand).toHaveBeenCalledTimes(1);
    expect(mockCommandInvoker.addCommand.mock.calls[0][0]).toBeInstanceOf(MoveCommand);
    expect(mockCommandInvoker.executeCommands).toHaveBeenCalledTimes(1);
  });

  it('should add WaitCommand on Space key press', () => {
    render(<App />);
		const mockCommandInvoker = (CommandInvoker as jest.Mock).mock.results[0].value;
    act(() => {
      fireEvent.keyDown(window, { key: ' ' }); // Spacebar
    });
    expect(mockCommandInvoker.addCommand).toHaveBeenCalledTimes(1);
    expect(mockCommandInvoker.addCommand.mock.calls[0][0]).toBeInstanceOf(WaitCommand);
    expect(mockCommandInvoker.executeCommands).toHaveBeenCalledTimes(1);
  });

  it('should update game state after a command is executed', () => {
    // мокируем изменение состояния игры после хода
    const nextGameState = { ...mockInitialGameState, turn: 2 };
    mockGameEngineInstance.getState
      .mockReturnValueOnce(mockInitialGameState) // при инициализации gameState
      .mockReturnValueOnce(mockInitialGameState) // при инициализации isGameRunning
      .mockReturnValueOnce(nextGameState);       // после нажатия клавиши в handleKeyDown

    render(<App />);
    // начальное состояние отображается
    expect(screen.getByText('Turn: 1')).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(window, { key: 'w' });
    });

    // компонент обновился с новым состоянием
    expect(screen.getByText('Turn: 2')).toBeInTheDocument();
  });

  it('should start a new game when "Start New Game" button is clicked', () => {
    // имитируем состояние "Game Over"
    mockGameEngineInstance.getState
      .mockReturnValueOnce({ ...mockInitialGameState, gameOver: true }) // Для инициализации gameState
      .mockReturnValueOnce({ ...mockInitialGameState, gameOver: true }); // Для инициализации isGameRunning (чтобы isGameRunning стало false)
    render(<App />);

    // кнопка "Start New Game" видна
    const startButton = screen.getByRole('button', { name: /start new game/i });
    expect(startButton).toBeInTheDocument();

    // настраиваем GameEngine для нового запуска
    (GameEngine as jest.Mock).mockClear(); // очищаем историю вызовов конструктора GameEngine
    mockGameEngineInstance.getState.mockReturnValueOnce(mockInitialGameState); // состояние после нового запуска

    act(() => {
      fireEvent.click(startButton);
    });

    // GameEngine был вызван снова (для новой игры)
    expect(GameEngine).toHaveBeenCalledTimes(1);
    expect(GameEngine).toHaveBeenCalledWith(mockInitialGameState.theme);
    // состояние игры сбросилось и isGameRunning = true
    expect(screen.getByText('Turn: 1')).toBeInTheDocument();
  });

  it('should switch theme and start new game when "Switch Theme" button is clicked', () => {
    render(<App />);
    
    const switchThemeButton = screen.getByRole('button', { name: /switch to forest theme/i });
    expect(switchThemeButton).toBeInTheDocument();

    // настраиваем GameEngine для нового запуска с новой темой
    (GameEngine as jest.Mock).mockClear(); //очищаем историю вызовов конструктора GameEngine
    const newTheme = GameTheme.FOREST;
    mockGameEngineInstance.getState.mockReturnValueOnce({ ...mockInitialGameState, theme: newTheme });

    act(() => {
      fireEvent.click(switchThemeButton);
    });

    // GameEngine был вызван с новой темой
    expect(GameEngine).toHaveBeenCalledTimes(1);
    expect(GameEngine).toHaveBeenCalledWith(newTheme);
    // панель статуса отображает новую тему
    expect(screen.getByText(`Theme: ${newTheme}`)).toBeInTheDocument();
  });

  it('should not process commands if game is not running', () => {
    mockGameEngineInstance.getState.mockReturnValue({ ...mockInitialGameState, gameOver: true });
    render(<App />);
		const mockCommandInvoker = (CommandInvoker as jest.Mock).mock.results[0].value;
    act(() => {
      fireEvent.keyDown(window, { key: 'w' });
    });
    expect(mockCommandInvoker.addCommand).not.toHaveBeenCalled();
    expect(mockCommandInvoker.executeCommands).not.toHaveBeenCalled();
  });
});