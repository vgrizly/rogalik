dict.init = function() {
    window.TT = function(text, args) {
        text = T(text)
        text.match(/{[^}]+}/g).forEach(function(v) {
            text = text.replace(v, T(args[v.slice(1, -1)]));
        })
        return text;
    };

    window.TS = function(text) {
        return T(util.symbolToString(text));
    };

    if (!game.config.language.Russian) {
        dict.update = function(){}
        window.T = function(text) {
            return text;
        };

        return;
    }
    window.T = function(text) {
        return dict[text] || text;
    };

    dict.update = function(elem) {
        var list = {};
        function update(elem) {
            if (elem.nodeType == 3) {
                var text = elem.textContent
                elem.textContent = T(text);
                list[text] = elem.textContent;
            } else if (elem.childNodes.length) {
                [].forEach.call(elem.childNodes, update);
            }
        }
        update(elem || document.body);
        // console.log(JSON.stringify(list));
    }

    dict.update();
}
