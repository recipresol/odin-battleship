import { createGame } from "./game"

test('exists', () => {
    expect(createGame).toBeDefined();
});

test('issues up to 2 controllers', () => {
    const game = createGame();
    expect(game.getController()).not.toBeNull();
    expect(game.getController()).not.toBeNull();
    expect(game.getController()).toBeNull();
});

test('issued controllers are distinct', () => {
    const game = createGame();
    const controller1 = game.getController();
    const controller2 = game.getController();
    expect(controller1 === controller2).toBe(false);
});

test('SETUP notification (only) after readying both controllers', () => {
    const game = createGame();
    const controller1 = game.getController();
    const controller2 = game.getController();
    let msg1 = null;
    let msg2 = null;
    controller1.setNotifyCallback((message, data) => msg1 = message);
    controller2.setNotifyCallback((message, data) => msg2 = message);
    controller1.readyController();
    expect(msg1).toBeNull();
    expect(msg2).toBeNull();
    controller2.readyController();
    expect(msg1).toBe("SETUP");
    expect(msg2).toBe("SETUP");
});