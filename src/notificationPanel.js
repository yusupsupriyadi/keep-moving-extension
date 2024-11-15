const vscode = require('vscode');

class NotificationPanel {
	static currentPanel = undefined;
	static viewType = 'keepMovingNotification';

	static createOrShow(context) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		if (NotificationPanel.currentPanel) {
			NotificationPanel.currentPanel.panel.reveal(column);
			return;
		}

		const panel = vscode.window.createWebviewPanel(
			NotificationPanel.viewType,
			'Time to Move!',
			vscode.ViewColumn.Two,
			{
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.joinPath(context.extensionUri, 'src', 'media'),
				],
			},
		);

		NotificationPanel.currentPanel = new NotificationPanel(
			panel,
			context.extensionUri,
		);
	}

	constructor(panel, extensionUri) {
		this.panel = panel;
		this.extensionUri = extensionUri;
		this.update();

		this.panel.onDidDispose(() => this.dispose(), null);

		this.panel.webview.onDidReceiveMessage((message) => {
			switch (message.command) {
				case 'snooze':
					vscode.commands.executeCommand('keep-moving.snooze');
					this.dispose();
					return;
				case 'dismiss':
					this.dispose();
					return;
			}
		});
	}

	dispose() {
		NotificationPanel.currentPanel = undefined;
		this.panel.dispose();
	}

	update() {
		const webview = this.panel.webview;
		this.panel.webview.html = this.getHtmlContent(webview);
	}

	getHtmlContent(webview) {
		const standingImageUri = webview.asWebviewUri(
			vscode.Uri.joinPath(
				this.extensionUri,
				'src',
				'media',
				'standing.svg',
			),
		);

		return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Time to Move!</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            'vscode-bg': 'var(--vscode-editor-background)',
                            'vscode-fg': 'var(--vscode-editor-foreground)', 
                            'vscode-btn': 'var(--vscode-button-background)',
                            'vscode-btn-hover': 'var(--vscode-button-hoverBackground)',
                            'vscode-desc': 'var(--vscode-descriptionForeground)'
                        }
                    }
                }
            }
        </script>
    </head>
    <body class="flex items-center justify-center min-h-screen m-0 p-4 font-sans text-vscode-fg bg-vscode-bg">
        <div class="w-full max-w-[400px] text-center bg-vscode-bg p-8 rounded-lg shadow-lg">
            <h1 class="text-[1.75rem] text-vscode-fg mb-4">Time to Stand Up and Move!</h1>
            <p class="text-vscode-desc leading-relaxed mb-8">Take a break and stretch for a minute. Your body will thank you! 💪</p>
            
            <div class="my-8 flex justify-center">
                <script src="https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs" type="module"></script> 
                <dotlottie-player 
                    src="https://lottie.host/0b17bbdc-303d-449f-afbd-1aeeb10b5211/LB0p3INLuN.json" 
                    background="transparent" 
                    speed="1" 
                    class="w-[300px] h-[300px]" 
                    loop 
                    autoplay>
                </dotlottie-player>
            </div>

            <div class="flex gap-4 justify-center mt-8">
                <button 
                    onclick="dismiss()" 
                    class="px-8 py-2 border-none rounded-lg cursor-pointer text-sm font-medium bg-vscode-btn text-white transition-all hover:bg-vscode-btn-hover hover:-translate-y-[1px] active:translate-y-0">
                    Got it! 👍
                </button>
                <button 
                    onclick="snooze()" 
                    class="px-8 py-2 border-none rounded-lg cursor-pointer text-sm font-medium bg-vscode-btn text-white transition-all hover:bg-vscode-btn-hover hover:-translate-y-[1px] active:translate-y-0">
                    Snooze (10s) ⏰
                </button>
            </div>
        </div>
        <script>
            const vscode = acquireVsCodeApi();
            
            function dismiss() {
                vscode.postMessage({ command: 'dismiss' });
            }
            
            function snooze() {
                vscode.postMessage({ command: 'snooze' });
            }
        </script>
    </body>
    </html>`;
	}
}

module.exports = NotificationPanel;
