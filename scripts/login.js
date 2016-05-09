/**
 * Created by tlh on 2016/5/8.
 */
$(document).ready(function () {
    $("#btn_login").click(function () {
        if (!validateForm($("#form_login")[0])) {
            return;
        }
        NProgress.start();
        $.ajax({
            type: "POST",
            url: "http://tanlehua.top/ReportSystem/account/login.do",
            dataType: 'json',
            data: {
                userId: $("#login-id").val(),
                password: $("#login-pass").val(),
                identity: $("#select_identity").val()
            },
            success: function (data) {
                NProgress.done();
                if (data.result == "failed") {
                    alert(data.msg);
                } else if (data.result == "success") {
                    alert(data.msg);
                    if (data.identity == 0) {
                        window.location.href = "student_home.html?userId=" + $("#login-id").val() + "identity=" + data.identity;
                    }
                    else if (data.identity == 1){
                        window.location.href = "teacher_home.html?userId=" + $("#login-id").val() + "identity=" + data.identity;
                    }
                }
            },
            error: function (jqXHR) {
                NProgress.done();
                alert("似乎出现了些小问题,错误码：" + jqXHR.status);
            }
        })
    });
});
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
                var id = element.id;
                if (element.name == "用户ID号") $('#login-id').tooltip('show');
                else $('#login-pass').tooltip('show');
                return false;
            }
        }
    }
    return true;
}

$(function () {
    $('[data-toggle=tooltip]').tooltip();
});

$(document).on('page:fetch',   function() { NProgress.start(); });
$(document).on('page:change',  function() { NProgress.done(); });
$(document).on('page:restore', function() { NProgress.remove(); });
NProgress.inc();