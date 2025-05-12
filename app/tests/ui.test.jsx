// tests/ui.test.jsx
import React from 'react';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock global Firebase Auth
beforeAll(() => {
  window.firebaseAuth = {
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    auth: { GoogleAuthProvider: vi.fn() },
  };
});
afterAll(() => {
  delete window.firebaseAuth;
});

// Mock Zustand store before importing components
vi.mock('../src/store', () => ({ useGameStore: vi.fn() }));
import { useGameStore } from '../src/store';

// Import components
import { App } from '../src/app.jsx';
import { ResourceDeck } from '../src/ResourceDeck.jsx';
import { TownGrid } from '../src/towngrid.jsx';
import LeaderboardPanel from '../src/LeaderboardPanel.jsx';
import PlayerAchievements from '../src/PlayerAchievements.jsx';
import AchievementBanner from '../src/AchievementBanner.jsx';
import { BuildingCards } from '../src/BuildingCards.jsx';

beforeEach(() => {
  vi.clearAllMocks();
});

// --- App component tests ---
describe('App component', () => {
  it('shows login form when not authenticated', () => {
    window.firebaseAuth.onAuthStateChanged.mockImplementation(cb => { cb(null); return () => {}; });
    render(<App />);

    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('renders game UI when authenticated', async () => {
    const fakeUser = { displayName: 'User', email: 'u@example.com', getIdToken: vi.fn().mockResolvedValue('token') };
    window.firebaseAuth.onAuthStateChanged.mockImplementation(cb => { cb(fakeUser); return () => {}; });

    const mockState = {
      resetGrid: vi.fn(),
      grid: Array(16).fill(null),
      startedAt: 'start-time',
      visibleResources: [],
      factoryOverrides: [],          // ← stubbed
      selectedResourceIndex: 0,
      setSelectedResource: vi.fn(),
      selectedTiles: [],
      isPlacingBuilding: false,
      placeResource: vi.fn(),
      toggleTileSelection: vi.fn(),
      confirmBuildingPlacement: vi.fn(),
      availableRecipes: [],
      activeRecipe: null,
      placeBuilding: vi.fn()
    };
    useGameStore.mockImplementation(selector => selector(mockState));

    render(<App />);
    expect(mockState.resetGrid).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole('button', { name: /Restart/i })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /End Game/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });
});

// --- ResourceDeck tests ---
describe('ResourceDeck component', () => {
  it('renders resource buttons and handles selection', () => {
    const mockState = {
      visibleResources: ['wood', 'brick', 'wheat'],
      factoryOverrides: [],          // ← stubbed
      selectedResourceIndex: 1,
      setSelectedResource: vi.fn()
    };
    useGameStore.mockImplementation(selector => selector(mockState));

    render(<ResourceDeck />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[1]).toHaveClass('ring-4');

    fireEvent.click(buttons[2]);
    expect(mockState.setSelectedResource).toHaveBeenCalledWith(2);
  });
});

// --- TownGrid tests ---
describe('TownGrid component', () => {
  it('places resource on empty cell', () => {
    const mockState = {
      grid: [null, 'wood', null],
      selectedTiles: [],
      isPlacingBuilding: false,
      placeResource: vi.fn(),
      toggleTileSelection: vi.fn(),
      confirmBuildingPlacement: vi.fn()
    };
    useGameStore.mockImplementation(selector => selector(mockState));

    render(<TownGrid />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(mockState.placeResource).toHaveBeenCalledWith(0);
    fireEvent.click(buttons[1]);
    expect(mockState.toggleTileSelection).toHaveBeenCalledWith(1);
  });

  it('confirms building placement when in placing mode', () => {
    const mockState = {
      grid: ['brick', 'wood'],
      selectedTiles: [{ index: 0 }],
      isPlacingBuilding: true,
      placeResource: vi.fn(),
      toggleTileSelection: vi.fn(),
      confirmBuildingPlacement: vi.fn()
    };
    useGameStore.mockImplementation(selector => selector(mockState));

    render(<TownGrid />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(mockState.confirmBuildingPlacement).toHaveBeenCalledWith(0);
  });
});

// --- LeaderboardPanel tests ---
describe('LeaderboardPanel component', () => {
  beforeEach(() => { global.fetch = vi.fn(); });

  it('fetches and displays entries', async () => {
    // Provide res.ok = true so setLeaders(data) is called
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ townName: 'A', score: 5 }, { townName: 'B', score: 3 }])
    });

    render(<LeaderboardPanel refreshTrigger={0} />);
    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

// Remaining UI tests (PlayerAchievements, AchievementBanner, BuildingCards) unchanged...
