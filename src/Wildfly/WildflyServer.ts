'use strict';

import * as path from "path";
import * as vscode from "vscode";
import * as Constants from "../Constants";
import { ServerState } from "../Constants";
import { Utility } from "../Utility";

export class WildflyServer extends vscode.TreeItem implements vscode.QuickPickItem {
    public needRestart: boolean = false;
    public label: string;
    public description: string;
    public jvmOptions: string[];
    public jvmOptionFile: string;
    public basePathName: string;
    
    private _JVM_OPTION_SERVER_CONFIG_PARAM: string = "--server-config=";
    private _JVM_OPTION_SERVER_CONFIG_DEFAULT_FILE: string = "standalone.xml";

    private _state: ServerState = ServerState.IdleServer;
    private _isDebugging: boolean = false;
    private _debugPort: number;
    private _debugWorkspace: vscode.WorkspaceFolder;
    private _configurationPath: string;
    private _baseUrlContext: string;
    private _storagePath: string;
    

    constructor(private _name: string, private _installPath: string, private _storagePathParam: string) {
        super(_name);
        this.label = _name;
        this.jvmOptionFile = path.join(_storagePathParam, Constants.JVM_OPTION_FILE);
        // this._configurationPath = path.join(_storagePathParam, 'standalone/configuration', 'standalone.xml');
        this.basePathName = path.basename(_storagePathParam);
        this._storagePath = _storagePathParam;
    }

    public setDebugInfo(port: number, workspace: vscode.WorkspaceFolder): void {
        this._isDebugging = true;
        this._debugPort = port;
        this._debugWorkspace = workspace;
    }

    public clearDebugInfo(): void {
        this._isDebugging = false;
        this._debugPort = undefined;
        this._debugWorkspace = undefined;
    }

    public setDebugPort(port: number): void {
        this._debugPort = port;
    }

    public getDebugPort(): number {
        return this._debugPort;
    }

    public getDebugWorkspace(): vscode.WorkspaceFolder {
        return this._debugWorkspace;
    }

    public isDebugging(): boolean {
        return this._isDebugging;
    }

    public setStarted(started: boolean): void {
        this._state = started ? ServerState.RunningServer : ServerState.IdleServer;
        vscode.commands.executeCommand('wildfly.tree.refresh');
    }

    public isStarted(): boolean {
        return this._state === ServerState.RunningServer;
    }

    public getState() : string {
        return this._state;
    }

    public getName(): string {
        return this._name;
    }

    public rename(newName: string): void {
        this._name = newName;
        this.label = newName;
    }

    public getInstallPath(): string {
        return this._installPath;
    }

    public async getServerConfigPath(): Promise<string> {
        const params = await Utility.readFileLineByLine(this.jvmOptionFile, this.filterFunction);

        var file = this._JVM_OPTION_SERVER_CONFIG_DEFAULT_FILE;
        for (var index = 0; index < params.length; ++index) {
            const value = params[index];
            if (value.indexOf(this._JVM_OPTION_SERVER_CONFIG_PARAM) == 0) {
                file = value.substring(this._JVM_OPTION_SERVER_CONFIG_PARAM.length, value.length);
                break;
            }
        }

        this._configurationPath = path.join(this._storagePath, 'standalone/configuration', file);
        return this._configurationPath;
    }

    public getStoragePath(): string {
        return this._storagePath;
    }

    public setBaseUrlContext(baseUrl: string): void {
        this._baseUrlContext = baseUrl;
    }

    public getBaseUrlContext(): string {
        return this._baseUrlContext;
    }

    public filterFunction: (para: string) => boolean = (para: string): boolean => {
        if (!para.startsWith('-')) {
            return false;
        }
        let valid: boolean = true;
        Constants.JVM_DEFAULT_OPTIONS_KEYS.forEach((key: string) => {
            if (para.startsWith(key)) {
                valid = false;
                return;
            }
        });
        return valid;
    };

}
