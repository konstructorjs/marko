const path = require('path');

module.exports = class marko {
  static setup(app) {
    require('marko/node-require').install({
      compilerOptions: {
        writeToDisk: false,
      },
    });

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
