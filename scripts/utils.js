/**
 * Created by tlh on 2016/5/17.
 */
function isFilled(field) {
    if (field.value.length < 1 || field.value == field.defaultValue) {
        return false;
    } else {
        return true;
    }
}
function validateForm(whichFrom) {
    for (var i = 0; i < whichFrom.elements.length; i++) {
        var element = whichFrom.elements[i];
        if (element.className.indexOf("required") != -1) {
            if (!isFilled(element)) {
                $(element).tooltip('show');
                return false;
            }
        }
    }
    return true;
}
function resetFields(whichForm) {
    //遍历表单的所有元素
    for (var i = 0; i < whichForm.elements.length; i++) {
        var element = whichForm.elements[i];
        //如果该元素是一个提交按钮，跳转到下一次循环开始
        if (element.type == "submit") continue;
        //如果该元素没有默认值，跳转到下一次循环开始
        if (!element.defaultValue) continue;
        //为该元素获得输入焦点时增加一个响应处理函数，如果是默认值则把值置为空
        element.onfocus = function () {
            if (this.value == this.defaultValue) {
                this.value = "";
            }
        };
        //为该元素失去输入焦点时增加一个事件处理函数，如果值如果为空，把值置为默认值。
        element.onblur = function () {
            if (this.value == "") {
                this.value = this.defaultValue;
            }
        }
    }
}
//获得地址栏中的参数
(function ($) {
    $.getUrlParam
        = function (name) {
        var reg
            = new RegExp("(^|&)" +
            name + "=([^&]*)(&|$)");
        var r
            = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
})(jQuery);
$(function () {
    $('[data-toggle=tooltip]').tooltip();
});
function notice(text, type) {
    switch (type){
        case 'success':
            new PNotify({
                text: text,
                type: 'success',
                buttons: {
                    closer: true
                }
            });
            break;
        case 'error':
            new PNotify({
                text: text,
                type: 'error',
                buttons: {
                    closer: true
                }
            });
            break;
        case 'info':
            new PNotify({
                text: text,
                type: 'info',
                buttons: {
                    closer: true
                }
            });
            break;
        default:
            new PNotify({
                text: text,
                type: 'info',
                buttons: {
                    closer: true
                }
            });
            break;
    }
}
// $(document).on('page:fetch', function () {
//     NProgress.start();
// });
// $(document).on('page:change', function () {
//     NProgress.done();
// });
// $(document).on('page:restore', function () {
//     NProgress.remove();
// });
// NProgress.inc();
PNotify.prototype.options.styling = "bootstrap3";
