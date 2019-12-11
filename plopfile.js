const path = require("path");

const TEMPLATE_PATH = `templates`;

// ! If string is updated, also update injectable templates
const INJECT_EXPORT = `RECLI_INJECT_EXPORT`;

/*
TODOs:
1) defaults for each prompt from a file or cli values
2) create a cli version of this that generates the templates and such (recli init?)
*/

const requireField = fieldName => {
    return value => {
        if (String(value).length === 0) {
            return fieldName + " is required";
        }
        return true;
    };
};

module.exports = plop => {
    const srcPath = `${plop.getPlopfilePath()}/src`;

    plop.load("plop-pack-fancy-comments", {
        prefix: "",
        upperCaseHeaders: true,
        commentStart: "",
        commentEnd: "",
    });

    plop.addHelper("absPath", p => path.resolve(srcPath, p));

    plop.setPrompt("directory", require("inquirer-directory"));

    plop.setGenerator("component", {
        description: "Create a reusable component",
        prompts: [
            {
                type: "input",
                name: "name",
                message: "What is your component name?",
                validate: requireField("name"),
            },
            {
                type: "confirm",
                name: "addStorybook",
                default: "No",
                message: "Need a storybook?",
            },
            {
                type: "list",
                name: "filetype",
                default: "ts",
                message: "What file type?",
                validate: requireField("filetype"),
                choices: ["ts", "js"],
            },
            {
                type: "directory",
                name: "path",
                message: "Where would you like to put this component?",
                basePath: srcPath,
            },
        ],
        actions: data => {
            const actions = [
                {
                    type: "add",
                    path:
                        "{{absPath path}}/{{pascalCase name}}/{{pascalCase name}}.{{filetype}}x",
                    templateFile: `${TEMPLATE_PATH}/Component/Component.js.hbs`,
                },
                {
                    type: "add",
                    path:
                        "{{absPath path}}/{{pascalCase name}}/{{pascalCase name}}.styled.{{filetype}}",
                    templateFile: `${TEMPLATE_PATH}/Component/Component.styled.js.hbs`,
                },
                {
                    type: "add",
                    path:
                        "{{absPath path}}/{{pascalCase name}}/index.{{filetype}}",
                    templateFile: `${TEMPLATE_PATH}/Component/index.js.hbs`,
                },
                {
                    type: "add",
                    path: "{{absPath path}}/index.{{filetype}}",
                    templateFile: `${TEMPLATE_PATH}/injectable-index.js.hbs`,
                    skipIfExists: true,
                },
                {
                    type: "append",
                    path: "{{absPath path}}/index.{{filetype}}",
                    pattern: `/* ${INJECT_EXPORT} */`,
                    template: `export * from './{{pascalCase name}}';`,
                },
            ];

            if (data.addStorybook) {
                actions.push({
                    type: "add",
                    path:
                        "{{absPath path}}/{{pascalCase name}}/{{pascalCase name}}.stories.{{filetype}}x",
                    templateFile: `${TEMPLATE_PATH}/Component/Component.stories.js.hbs`,
                });

                actions.push({
                    type: "add",
                    path:
                        "{{absPath path}}/{{pascalCase name}}/{{pascalCase name}}.md",
                    templateFile: `${TEMPLATE_PATH}/Component/Component.md.hbs`,
                });
            }

            actions.push(
                `Your fancy "${data.name}" has been created!! Now go do something crazy`
            );

            return actions;
        },
    });
};
