function CustomSearch(element, options) {
    this.element = element || null;
    this.url = options?.url || "https://raw.githubusercontent.com/reinowis/auto-suggestion/main/data1.json";
    this.triggerNoKey = options?.triggerNoKey || 1;
    this.blocks = options?.block || ['term', 'collection', 'product'];
    this.triggered = 0;
    this.data = {};
    this.results;
    this._registerEvents();
}
CustomSearch.prototype._hidePopup = function (popup) {
    const self = this;
    $(self.results).css('display', 'none');
}

CustomSearch.prototype._showPopup = function (popup) {
    const self = this;
    $(self.results).css('display', 'block');
}

CustomSearch.prototype._displayPopup = function (popup) {
    const self = this;
    console.log(self.element);
    $(self.results).css({
        position: 'fixed',
        'z-index': 999,
        top: self.element.offset().top + self.element.height(),
        left: self.element.offset().left,
        width: self.element.width()
    })
}

CustomSearch.prototype._renderItem = function (item, type) {
    const self = this;
    const itemEle = $('<li></li>');
    itemEle.addClass('custom-search__results__item');
    const itemWrapper = $(`<a class='custom-search__results__item__wrapper' href='${item.url}'></a>`);
    if (type === 'product') {
        itemEle.addClass('custom-search__results__item--image');
        const contentImage = $(`<img class='custom-search__results__item__image' src='${item?.image}'></img>`);
        const contentWrapper = $('<div></div>').addClass('custom-search__results__item__content');
        const contentTitle = $('<span></span>').addClass('custom-search__results__item__title').text(item?.title);
        contentWrapper.append(contentTitle);
        const contentBrand = $('<span></span>').addClass('custom-search__results__item__subtitle').text(item?.brand);
        contentWrapper.append(contentBrand);
        const contentPrice = $('<span></span>').addClass('custom-search__results__item__subtitle').text(item?.price);
        contentWrapper.append(contentPrice);
        itemWrapper.append(contentImage).append(contentWrapper);
    } else {
        itemWrapper.text(item?.title || item?.term);
    }
    itemEle.append(itemWrapper);
    return itemEle;

}

CustomSearch.prototype._renderGroup = function (title, data) {
    const self = this;
    const group = $('<div></div>');

    console.log(data);
    if (title)
    group.addClass('custom-search__results__group');
    
    const groupTitle = $('<h5></h5>');
    groupTitle.addClass('custom-search__results__title');
    groupTitle.text(title);
    group.append(groupTitle);
    
    const groupContent = $('<ul></ul>')
    groupContent.addClass('custom-search__results__list');
    if (typeof data === 'object' && data?.length > 0) {
        data.forEach(function(item) {
            const itemEle = self._renderItem(item, title);
            groupContent.append(itemEle);
        })
    }
    group.append(groupContent);
    return group;
}

CustomSearch.prototype._renderData = function(data) {
    const self = this;
    const results = $(`<div></div>`);
    console.log(data);
    results.addClass('custom-search__results');
    console.log(self.blocks);
    self?.blocks?.forEach(function(block) {
        if (data[block]) {
            const groupEle = self._renderGroup(block, data[block]);
            results.append(groupEle);
        }
    });
    self.results = results;
    self._displayPopup();
    $('body').append(results);
}
CustomSearch.prototype._triggerData = function () {
    const self = this;
    $.ajax({
        type: "get",
        url: self.url,
        dataType: "json",
        success: function (response) {
            console.log('get');
            if (self.results) {
                self.results.remove();
            }
            // self.data = response;
            console.log(response);
            self._renderData();
        },
        error: function(err) {
            console.log(err);
        }
    });
}
CustomSearch.prototype._registerEvents = function() {
    const self = this;
    this.element.on('keydown', function(evt) {
        const specialKeys = ['Backspace'];
        if (self.triggered >= self.triggerNoKey || specialKeys.includes(evt?.originalEvent?.key)) {
            self.triggered = 0;
            self._triggerData();
        } else {
            self.triggered++;
        }
    })
    this.element.on('change', function(evt) {
        if (!String(self.element.val())?.length) {
            self._hidePopup();
        }
    })
    this.element.on('focus', function() {
        self._showPopup();
    })
    // this.element.on('blur', function(evt) {
    //     self._hidePopup();
    // })
}
$.fn.customSearch = function (options) {
    options = options || {};

    if (typeof options === 'object') {
        this.each(function () {
            var instanceOptions = $.extend(true, {}, options);
            console.log($(this));
            var instance = new CustomSearch($(this), instanceOptions);
            return instance;
        });

        return this;
    } else {
        throw new Error('Invalid arguments for Custom Search: ' + options);
    }
};