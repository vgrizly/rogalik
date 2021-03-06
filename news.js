function News() {
    var news = [
        [
            "Восприятие и мудрость",
            "05.01.2015",
            "Добавлены два новых атрибута: восприятие и мудрость, и два соответствующих витамина.",
            "Помимо этого изменены связи между витаминами и атрибутами.",
            "Также пересмотрены привязки навыков к атрибутам. Скажем, фермерство теперь зависит от восприятия, а кулинария от мудрости.",
            "Увеличин прирост количества витаминов при повышении качества еды.",
            "Почти вся сырая еда больше не дает никаких витаминов.",
            "Повышение навыка больше не вызывает понижение связанного. Вместо этого на повышение навыка теперь требуется больше витаминов, пропорционально уровню связанного навыка."
        ],
        [
            "Баланс",
            "04.01.2015",
            "Уменьшен эффект замедления от переедания жажды до 45%. Таким образом персонаж может двигаться, хотя и очень медленно, при наличии обоих эффектов.",
            "Постройка респауна стала еще легче",
        ],
        [
            "Автокрафт и автоперемещение",
            "03.01.2015",
            "Добавлена кнопка перемещения всего содержимого контейнера.",
            "Добавлена кнопка запускающая автоматический крафт, пока не кончатся ресурсы.",
        ],
        [
            "Лук, стены и знамена",
            "03.01.2015",
            "Добавлены:",
            [
                "Лук репчатый и зеленый",
                "Знамена",
                "Новые книжки",
            ],
            "Библиотека при имперской канцелярии открыта для всех желающих на рыночной площади."
        ],
        [
            "Обновление предметов",
            "02.01.2015",
            "Добавлены:",
            [
                "плетеный забор",
                "книжный шкаф",
            ],
            "Обновлены рецепты некоторых предметов.",
            "На бумаге теперь можно писать.",
        ],
        [
            "Плуг и каменные стены",
            "30.12.2014",
            "Добавлены:",
            [
                "плуг",
                "новые каменные стены в ассортименте",
                "поленница",
                "настройка разрешающая выделять себя",
            ],
        ],
        [
            "Новогодний ивент",
            "29.12.2014",
            "Дед Мороз и снегурка выдают подарки на рыночной площади в обмен на этомы.",
            "Нафарми елку — создай праздничное настроение :3",
        ],
        [
            "Можно копать землю",
            "25.12.2014",
            "Лопатой можно копать землю получая соответствующий предмет. " +
                "Затем полученной землей можно засыпать вспаханную землю и неглубокую воду.",
            "Также копание теперь можно ставить в очередь используя шифт+пробел+клик.",
        ],
        [
            "Новости",
            "25.12.2014",
            "Добавлены внутреигровые новости.",
            "Так же читайте новости в нашей <a href=http://vk.com/rogalik_mmo target=_blank>группе вк</a>.",
        ],
    ];

    var lsKey = "news.viewed";
    var viewed = localStorage.getItem(lsKey) || news.length;
    var list = document.createElement("ul");

    function makeList(items) {
        var list = document.createElement("ul");
        items.forEach(function(html) {
            var item = document.createElement("li");
            item.innerHTML = html;
            list.appendChild(item);
        })
        return list;
    }

    this.show = function() {
        localStorage.setItem(lsKey, news.length);
        news.forEach(function(record, i) {
            var title = record.shift();
            var date = record.shift();

            var item = document.createElement("li");
            if (i < news.length - viewed)
                item.classList.add("unread");

            var time = document.createElement("time");
            time.textContent = date;
            item.appendChild(time);

            var summary = document.createElement("div");
            summary.className = "summary";
            summary.textContent = title;
            item.appendChild(summary);


            var details = document.createElement("div");
            details.className = "details";
            record.forEach(function(row) {
                if (Array.isArray(row)) {
                    details.appendChild(makeList(row));
                } else {
                    var p = document.createElement("p");
                    p.innerHTML = row;
                    details.appendChild(p);
                }

            });
            item.appendChild(details);

            list.appendChild(item);
        })
        this.panel.hooks.show = null;
    }.bind(this)

    this.panel = new Panel("news", "Good news, everyone!", [list]);
    if (this.panel.visible)
        this.show()
    else
        this.panel.hooks.show = this.show;

    if (viewed < news.length)
        this.panel.show();
}
