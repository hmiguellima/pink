/**
 * @module Pink.Data.ModalWindow
 * @desc Modal window widget
 * @author hlima, ecunha, ttt  AT sapo.pt
 * @version 1
 */    

Ink.createModule('Pink.Data.ModalWindow', '1', ['Pink.Data.Binding_1', 'Ink.Dom.Selector_1','Ink.UI.Modal_1'], function(ko, Selector, Modal) {
    var Module = function(options) {
        var self = this;

        this.moduleName = 'Pink.Data.ModalWindow';
        this.modal = undefined;
        this.title = options.title;
        this.contentModule = options.contentModule;
        this.contentReady = false;
        this.modalEl = undefined;
        this.modalWidth = options.modalWidth || "80%";
        this.modalHeight = options.modalHeight || "80%";
        this.cancelVisible = ko.computed(function() {
           var cancelVisible = ko.unwrap(options.cancelVisible);
           return (typeof cancelVisible == 'boolean'?cancelVisible:true); 
        }); 
        this.confirmCaption = ko.computed(function() {
            return ko.unwrap(options.confirmCaption) || 'Confirm';
        });

        
        this.taskButtonsArray = ko.observable();
        this.taskButtons = ko.computed(function() {
            var buttons = ko.unwrap(self.taskButtonsArray());
            
            return buttons ? buttons : [];
        });

        // Options passed to the content module
        this.moduleData = {
            confirmHandler: undefined, 
            cancelHandler: undefined, 
            confirmDisabled: ko.observable(false), 
            params: undefined, 
            hide: this.hide.bind(this) 
        };
        
        this.confirmDisabled = ko.computed(function() {
           return ko.unwrap(self.moduleData.confirmDisabled()); 
        });

        this.notifyContentReady = function() {
            self.contentReady = true;
        };

        options.parent['modal'] = {
            show: function(params) {
                self.show(params);
            }
        }; 
    };

    Module.prototype.confirm = function() {
        if (this.moduleData.confirmHandler && (typeof this.moduleData.confirmHandler == 'function')) {
            this.moduleData.confirmHandler();
        }
    };
    
    Module.prototype.cancel = function() {
        if (this.moduleData.params.cancelCallback && (typeof this.moduleData.params.cancelCallback == 'function')) {
            this.moduleData.params.cancelCallback();
        }
    };
    
    Module.prototype.hide = function() {
        this.modal.dismiss();
    };
    
    Module.prototype._hideModal = function() {
        var self=this;
        var content;
        
        if (this.modal) {
            this.modal.destroy();
            content = Selector.select("#modalContent", this.modalEl)[0];
            ko.cleanNode(content);
            content.innerHTML = '';
            
            // If there's a focused element, let's loose it's focus
            document.activeElement.blur();
            
            // Hack to remove previous modal attributes
            window.setTimeout(function() {
                self.modalEl.removeAttribute('style');
                self.modalEl.parentNode.removeAttribute('data-instance');
            }, 400);
        }
    };
    
    Module.prototype.afterRender = function(elements) {
    	this.modalEl = Selector.select(".ink-modal", elements[0])[0];
    };

    Module.prototype.show = function(params) {
        var content;
        
        this.modal = new Ink.UI.Modal(this.modalEl, {onDismiss: this._hideModal.bind(this)});
        this.modal.open();
        this.taskButtonsArray(params.taskButtons);
        this.moduleData.params = params;
        this.moduleData.confirmHandler = undefined;

        content = Selector.select("#modalContent", this.modalEl)[0];

        ko.cleanNode(content);

        content.innerHTML = '<!--ko module: {name: contentModule, notifyReady: notifyContentReady, data: moduleData}--><!--/ko-->';

        ko.applyBindings(this, content);
        
        // Hack to fix the scroll bar to the top in Firefox
        content.style.overflowY = 'hidden';
        window.setTimeout(function() {
            content.scrollTop = 0;
            content.style.overflowY = 'auto';
        }, 250);
    };
    
    Module.prototype.handleTask = function(handler) {
        handler.call(this, this);
    };

    return Module;
});
