const path = require('path');
const chokidar = require('chokidar');

module.exports = class marko {
  constructor(options = {}) {
    this.liveReload = options.liveReload || true;
    this.writeToDisk = options.writeToDisk || false;
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
      const currentDirectory = process.cwd();
      chokidar.watch(`${currentDirectory}/**/*.marko`).on('change', (file) => {
        hotReload.handleFileModified(file);
      });
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
        templatePath = path.join(path.join(process.cwd(), ctx.route), templatePath);
      }
      if (args.length === 3) {
        [data, ctx, appObj] = args;
        data = data || {};
        templatePath = path.join(process.cwd(), ctx.route, './index.marko');
      }
      if (args.length === 2) {
        [ctx, appObj] = args;
        templatePath = path.join(process.cwd(), ctx.route, './index.marko');
      }

      ctx.type = 'html';
      return appObj.render(templatePath, data);
    };
  }
};
