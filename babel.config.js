// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const tsconfig = require('./tsconfig.json');
const paths = tsconfig.compilerOptions.paths;
const alias = {};

for (const [key, value] of Object.entries(paths)) {
    alias[key.replace('/*', '')] = value.map(str => str.replace('/*', ''));
}

// eslint-disable-next-line no-undef
module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./'],
                    extensions: [
                        '.ios.js',
                        '.android.js',
                        '.js',
                        '.ts',
                        '.tsx',
                        '.json'
                    ],
                    alias
                }
            ],
            ['module:react-native-dotenv']
        ]
    };
};
