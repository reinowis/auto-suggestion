/*jshint esversion: 6 */
function AutoSuggestion(element, options) {
    this.element = element;
    this._url = options.url || '';
    this._triggerNoKey = options.triggerNoKey || 1;
    this._blocks = options.blocks || ['term', 'collection', 'product'];
    this._renderItem = options.renderItem || _renderItem;
    this._renderGroup = options.renderGroup || _renderGroup;
    this._renderViewMore = options.renderViewMore || _renderViewMore;
    this._customWrapperClasses = options.customWrapperClasses;
    this._key = options.key || 'search';
    this._data = {};
    this._triggered = 0;
    function _renderItem (item, type) {
        const self = this;
        const itemEle = $('<li></li>');
        itemEle.addClass('auto-suggestion__results__item');
        const itemWrapper = $(`<a class='auto-suggestion__results__item__wrapper' href='${item._url}'></a>`);
        if (type === 'product') {
            itemEle.addClass('auto-suggestion__results__item--image');
            const contentImage = $(`<img class='auto-suggestion__results__item__image' src='${item.image}'></img>`);
            const contentWrapper = $('<div></div>').addClass('auto-suggestion__results__item__content');
            const contentTitle = $('<span></span>').addClass('auto-suggestion__results__item__title').text(item.title);
            contentWrapper.append(contentTitle);
            const contentBrand = $('<span></span>').addClass('auto-suggestion__results__item__subtitle').text(item.brand);
            contentWrapper.append(contentBrand);
            const contentPrice = $('<span></span>').addClass('auto-suggestion__results__item__price').text(item.price);
            contentWrapper.append(contentPrice);
            itemWrapper.append(contentImage).append(contentWrapper);
        } else {
            itemWrapper.text(item.title || item.term);
        }
        itemEle.append(itemWrapper);
        return itemEle;
    
    }
    
    function _renderGroup (title, data) {
        const self = this;
        const group = $('<div></div>');
        group.addClass('auto-suggestion__results__group');
        
        const groupTitle = $('<h5></h5>');
        groupTitle.addClass('auto-suggestion__results__title');
        groupTitle.text(title);
        group.append(groupTitle);
        
        const groupContent = $('<ul></ul>')
        groupContent.addClass('auto-suggestion__results__list');
        if (typeof data === 'object' && data.length > 0) {
            data.forEach(function(item) {
                const itemEle = self._renderItem(item, title);
                groupContent.append(itemEle);
            })
        }
        group.append(groupContent);
        return group;
    }

    function _renderViewMore () {
        const viewMoreEle = $(`<a href='#'></a>`);
        viewMoreEle.addClass('auto-suggestion__results__view-more');
        viewMoreEle.text('View all products');
        return viewMoreEle;
    }

    this._destroyPopup = function () {
        const self = this;
        if (self._resultsElement) {
            self._resultsElement.remove();
        }
        if (self._data) {
            self._data = {};
        }
    };

    this._hidePopup = function () {
        const self = this;
        $(self._resultsElement).css('display', 'none');
        if (self._backgroundElement) {
            self._backgroundElement.remove();
        }
    };
    
    this._showPopup = function (popup) {
        const self = this;
        $(self._resultsElement).css('display', 'block');
    };
    
    this._displayPopup = function (popup) {
        const self = this;
        if (self._resultsElement) {
            $(self._resultsElement).css({
                position: 'fixed',
                display: 'block',
                'z-index': 999,
                top: self.element.offset().top + self.element.height() + 10,
                left: self.element.offset().left,
                width: self.element.width()
            });
        }
    };
    
    
    
    this._renderData = function() {
        const self = this;
        const results = $(`<div></div>`);
        results.addClass('auto-suggestion__results');
        if (this._customWrapperClasses) {
            results.addClass(this._customWrapperClasses);
        }
        Object.keys(self._data).forEach(function(key) {
            if (self._blocks.includes(key)) {
                const groupEle = self._renderGroup(key, self._data[key]);
                results.append(groupEle);
            }
        });
        results.append(self._renderViewMore());
        $('body').append(results);
        self._resultsElement = results;
        if (self._backgroundElement) {
            self._backgroundElement.remove();
        }
        self._backgroundElement = $(`<div class='auto-suggestion__results__background'></div>`);
        self._backgroundElement.on('click', function () {
            self._hidePopup();
        });
        self._backgroundElement.insertAfter(self._resultsElement);
        self._displayPopup();
    };
    
    this._triggerData = function () {
        const self = this;
        $.ajax({
            type: "get",
            url: self._url,
            // For the demo purpose, use a random API URL,
            // url: !Math.round(Math.random()) ? 'https://raw.githubusercontent.com/reinowis/auto-suggestion/main/data/data1.json': 'https://raw.githubusercontent.com/reinowis/auto-suggestion/main/data/data2.json',
            dataType: "json",
            data: { [self._key]: self.element.val() },
            success: function (response) {
                if (self._resultsElement) {
                    self._resultsElement.remove();
                }
                self._data = response;
                self._renderData();
            },
            error: function(err) {
                console.log(err);
            }
        });
    };

    this._clearInput = function() {
        this.element.val('');
    };
    this._toggleClearButton = function (toggle = false) {
        const self = this;
        if (String(self.element.val()).length > 0 && toggle) {
            $(self._clearButton).css('display', 'block');
        } else {
            self._hidePopup();
            $(self._clearButton).css('display', 'none');
        }

    };
    this._registerEvents = function() {
        const self = this;
        this.element.on('keyup', function(evt) {
            const specialKeys = ['Backspace'];
            if (self._triggered >= self._triggerNoKey - 1 || specialKeys.includes(evt.originalEvent.key)) {
                self._triggered = 0;
                self._triggerData();
            } else {
                self._triggered++;
            }
            self._toggleClearButton(true);
        });
        this.element.on('change', function(evt) {
            if (!String(self.element.val()).length) {
                self._destroyPopup();
            }
        });
        this.element.on('focus', function() {
            if (String(self.element.val()).trim().length > 0) {
                if (self._data) {
                    self._displayPopup();
                }
            }
             else {
                self._destroyPopup();
                self._hidePopup();
            }
            
        });
        this.element.on('blur', function(evt) {
            self._hidePopup();
        });
    };
    this._initInput = function() {
        const self = this;
        self.element.addClass('auto-suggesstion__input');
        self._wrapElement = $(`<div class='auto-suggestion__wrapper'></div>`);
        self.element.wrap(self._wrapElement);
        self._clearButton = $(`<span class='auto-suggestion__clear'>x</span>`);
        self._clearButton.on('click', function () {
            self._clearInput();
            self._toggleClearButton();
        });
        self._clearButton.css('display', 'none').insertAfter(self.element);
    };
    this._registerEvents();
    this._initInput();
}
$.fn.autoSuggestion = function (options) {
    options = options || {};

    if (typeof options === 'object') {
        this.each(function () {
            var instanceOptions = $.extend(true, {}, options);
            var instance = new AutoSuggestion($(this), instanceOptions);
            return instance;
        });
        return this;
    } else {
        throw new Error('Invalid arguments for Custom Search: ' + options);
    }
};