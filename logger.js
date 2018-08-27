const GLib = imports.gi.GLib;

function Logger(module, verboseLevel){
  this.moduleName = "[" + module + "]";
  this.level = verboseLevel;

  this.checkLevel = function(level){
    //global.log(level, this.level)
    return level >= this.level;
  }
  this.log = function(logLevelName, message, level){
    if(this.checkLevel(level)){
      global.log("[" + logLevelName + "]" + this.moduleName + " " + message);
    }
  }

  this.debug = function(message){
    this.log("DEBUG", message, Logger.LEVEL_DEBUG);
  }

  this.info = function(message){
    this.log("INFO", message, Logger.LEVEL_INFO);
  }

  this.warn = function(message){
    this.log("WARN", message, Logger.LEVEL_WARN);
  }

  this.error = function(message){
    this.log("ERROR", message, Logger.LEVEL_ERROR);
  }
}

Logger.LEVEL_DEBUG = 0;
Logger.LEVEL_INFO = 1;
Logger.LEVEL_WARN = 2;
Logger.LEVEL_ERROR = 3;

