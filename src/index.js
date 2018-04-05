const path = require('path');
const chokidar = require('chokidar');

const currentDirectory = process.cwd();

module.exports = class marko {
  constructor(options = {}) {
    // currently set to false until bug fixes are resolved
    this.liveReload = (typeof options.liveReload === 'boolean') ? options.liveReload : false;
    this.writeToDisk = (typeof options.writeToDisk === 'boolean') ? options.writeToDisk : false;
    this.sourceFolder = (typeof options.sourceFolder === 'string') || './src';
    this.hotReloadDir = (typeof options.hotReloadDir === 'string') || path.join(currentDirectory, this.sourceFolder, './**/*.marko');
    this.watchDirs = [currentDirectory, path.join(currentDirectory, './assets/js'), path.join(currentDirectory, './assets/css')];
    this.watchServer = (typeof options.watchServer === 'object') || {
      extraExts: ['marko'],
    };
  }

  setup(app) {
    require('marko/node-require').install({
      compilerOptions: {
        writeToDisk: this.writeToDisk,
      },
    });

    if (this.liveReload) {
      const hotReload = require('marko/hot-reload');
      hotReload.enable();
      chokidar.watch(this.hotReloadDir).on('change', (file) => {
        hotReload.handleFileModified(file);
      });

      const livereload = require('livereload');
      const lrserver = livereload.createServer(this.watchServer);
      lrserver.watch(this.watchDirs);
    }

    app.render = async (templatePath, data) => {
      const template = require(templatePath);
      return template.stream(data);
    };

    app.mixins.render = async (...args) => {
      let data;
      let ctx;
      let appObj;
      let templatePath;
      if (args.length === 4) {
        [templatePath, data, ctx, appObj] = args;
        templatePath = path.join(
          path.join(process.cwd(), this.sourceFolder, ctx.route),
          templatePath,
        );
      }
      if (args.length === 3) {
        [data, ctx, appObj] = args;
        data = data || {};
        templatePath = path.join(process.cwd(), this.sourceFolder, ctx.route, './index.marko');
      }
      if (args.length === 2) {
        [ctx, appObj] = args;
        templatePath = path.join(process.cwd(), this.sourceFolder, ctx.route, './index.marko');
      }
      const injectedData = Object.assign({}, ctx.state, data);
      ctx.type = 'html';
      return appObj.render(templatePath, injectedData);
    };
  }
};
