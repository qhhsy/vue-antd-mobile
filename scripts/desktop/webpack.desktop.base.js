const path = require('path');
const hljs = require('highlight.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const htmlPlugin = new HtmlWebpackPlugin({
    filename:'index.html',
    template:path.join(__dirname,'../../sites/desktop/index.html'),
    inject:true
});
const copyPlugin = new CopyWebpackPlugin([{
    from:path.join(__dirname,'../../sites/desktop/style/logo.png'),
    to:path.join(__dirname,'../../docs/desktop')
}]);

const md = require('markdown-it')({
    highlight:function(str,lang){
        if(lang && hljs.getLanguage(lang)){
            let hlStr = '<pre><code>' +
                hljs.highlight(lang,str).value +
                '</code></pre>';
            return hlStr;
        }
        return '';
    }
}).use(require('markdown-it-container'),'codebox',{
    validate(params){
        return params.trim().match(/^codebox\s*(.*)$/);
    },
    render(tokens,idx){
        if(tokens[idx].nesting === 1){
            const titleIdx = idx+2;
            const descIdx = idx+3+2;
            const codeIdx = idx+3+3+1;
            const titleContent = tokens[titleIdx].content;
            const descContent = tokens[descIdx].content;

            const matches = /\((.+)\)/.exec(descContent);

            const pathContent = matches && matches.length ? matches[1] : '';
            const codeContent = tokens[codeIdx].markup + tokens[codeIdx].info + '\n' 
                + tokens[codeIdx].content + tokens[codeIdx].markup;
            let codeHighlight = md.render(codeContent);

            // handle {{}} will read data in vue
            codeHighlight = codeHighlight.replace(/(\{\{)(.*)(\}\})/g,'<span>$1</span><span>$2</span><span>$3</span>');
            return `
                <code-box>
                    <template slot="title">${titleContent}</template>
                    <template slot="desc">${descContent}</template>
                    <template slot="code">${codeHighlight}</template>
                    <template slot="demo"><phone-box path="${pathContent}" /></template>
            `;
        }else{
            return '</code-box>';
        }
    }
});


module.exports = {
    entry: {
        app: [path.join(__dirname, '../../sites/desktop/index.js')]
    },
    output: {
        path: path.join(__dirname, '../../docs/desktop'),
        filename: '[name].js',
        publicPath: './'
    },
    externals: {
        'vue': 'Vue',
        'vue-router':'VueRouter',
        'vuex':'Vuex'
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            '@': path.join(__dirname, '../../sites/desktop')
            //vue:'vue/dist/vue.js'
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                },
                exclude: /node_modules/
            },
            {
                test: /\.(gif|jpg|png|woff|svg|eot|ttf)\??.*$/,
                loader: 'url-loader?limit=8192'
            },
            {
                test: /\.md$/,
                loader: 'vue-markdown-loader',
                options: md
            }
        ]
    },
    plugins:[
        htmlPlugin,
        copyPlugin
    ]
};