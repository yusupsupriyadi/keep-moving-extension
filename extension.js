const vscode = require('vscode');
const NotificationPanel = require('./src/notificationPanel');

let reminderInterval;
let isActive = true;
let statusBarItem;
let extensionContext;

// Development configuration
const REMINDER_INTERVAL = 5 * 60 * 1000; // 5 minutes for testing
const SNOOZE_DURATION = 10 * 1000; // 10 seconds for testing

function activate(context) {
	extensionContext = context;
	console.log('Keep Moving extension is now active!');

	// Create status bar item
	statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		100,
	);
	statusBarItem.command = 'keep-moving.showMenu';
	context.subscriptions.push(statusBarItem);
	updateStatusBar();

	// Register commands
	let disposableCommands = [
		vscode.commands.registerCommand('keep-moving.showMenu', showMenu),
		vscode.commands.registerCommand('keep-moving.toggle', toggleReminders),
		vscode.commands.registerCommand('keep-moving.snooze', () => {
			clearInterval(reminderInterval);
			setTimeout(() => startReminders(context), SNOOZE_DURATION);
			vscode.window.showInformationMessage(
				'Reminders snoozed for 10 seconds',
			);
		}),
	];

	context.subscriptions.push(...disposableCommands);

	// Start the reminders immediately
	startReminders(context);
	statusBarItem.show();
}

function showMenu() {
	const items = [
		{
			label: isActive ? 'Pause Reminders' : 'Resume Reminders',
			description: isActive
				? 'Temporarily stop notifications'
				: 'Start notifications again',
		},
		{
			label: 'Snooze (10 sec)',
			description: 'Pause notifications for 10 seconds',
		},
	];

	vscode.window.showQuickPick(items).then((selection) => {
		if (!selection) return;

		if (selection.label.includes('Reminders')) {
			toggleReminders();
		} else if (selection.label === 'Snooze (10 sec)') {
			vscode.commands.executeCommand('keep-moving.snooze');
		}
		updateStatusBar();
	});
}

function toggleReminders() {
	isActive = !isActive;
	if (isActive) {
		startReminders(extensionContext);
		vscode.window.showInformationMessage(
			'Keep Moving reminders activated!',
		);
	} else {
		stopReminders();
		vscode.window.showInformationMessage(
			'Keep Moving reminders deactivated.',
		);
	}
	updateStatusBar();
}

function updateStatusBar() {
	statusBarItem.text = `$(person) ${
		isActive ? 'Keep Moving' : 'Keep Moving (Paused)'
	}`;
	statusBarItem.tooltip = isActive
		? 'Click to manage movement reminders'
		: 'Movement reminders are paused. Click to resume';
}

function startReminders(context) {
	if (reminderInterval) {
		clearInterval(reminderInterval);
	}

	reminderInterval = setInterval(() => {
		if (isActive) {
			NotificationPanel.createOrShow(context);
		}
	}, REMINDER_INTERVAL);
	updateStatusBar();
}

function stopReminders() {
	if (reminderInterval) {
		clearInterval(reminderInterval);
		reminderInterval = null;
	}
	updateStatusBar();
}

function deactivate() {
	stopReminders();
	if (statusBarItem) {
		statusBarItem.dispose();
	}
}

module.exports = {
	activate,
	deactivate,
};
