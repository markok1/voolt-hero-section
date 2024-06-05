$(document).ready(function () {
  var leadID = null;
  let formData = {
    email: "",
    phone: "",
    comments: "",
  };
  let quoteForm = $("section.discount3");

  var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
      sURLVariables = sPageURL.split("&"),
      sParameterName,
      i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split("=");

      if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
    }
    return null;
  };
  const sendEvent = (eventName, props = {}, callback = () => {}) => {
    if (typeof eventName === "undefined" || !eventName) return callback();
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: eventName,
        ...props,
      });
      setTimeout(() => {
        return callback();
      }, 250);
    } catch (err) {
      console.log(err);
    }
  };

  //Format phone
  $(".phone-js").on("input", function () {
    var value = $(this).val().replace(/\D/g, ""); // Remove non-digits
    if (value.length > 10) value = value.substring(0, 10); // Limit to 10 digits

    if (value.length <= 3) $(this).val(value);
    else if (value.length <= 6) $(this).val(`(${value.substring(0, 3)}) ${value.substring(3)}`);
    else $(this).val(`(${value.substring(0, 3)}) ${value.substring(3, 6)}-${value.substring(6)}`);
  });

  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  function splitCookieForGTM(gaCookie) {
    if (typeof gaCookie === "boolean") {
      return "";
    } else {
      let splitCookie = gaCookie.split(".");
      return `${splitCookie[2]}.${splitCookie[3]}`;
    }
  }

  function submitLead(data, type = "form") {
    var formDataObject = data;

    console.log("subbmit lead", data);

    formDataObject["hash"] = $('input[name="hash"]').val();
    formDataObject["leadId"] = leadID;
    formDataObject["pathUrl"] = window.location.href;
    formDataObject["gclid"] = getUrlParameter("gclid");
    formDataObject["googleClientId"] = getCookie("_ga") ? splitCookieForGTM(getCookie("_ga")) : "";

    if (!formDataObject.fullName && formDataObject.email) {
      const email = formDataObject.email;
      const match = email.match(/^([^@]+)/);
      formDataObject["fullName"] = match ? match[1] : null;
    }

    $("button").attr("disabled", "disabled");
    $.ajax({
      url: "https://api.voolt.com/api/public/websitev2/1/leads",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(formDataObject),
      success: function (response) {
        $("button").removeAttr("disabled");
        if (type == "form") {
          $(".form-holder").addClass("hide-form");
          $(".quote-form--completed").removeClass("hide-form");
          window._conv_q = window._conv_q || [];
          _conv_q.push(["triggerConversion", "100449874"]);
          sendEvent("submitLeadForm", { email: formDataObject["email"] });
        }

        if (type == "email-catcher") {
          $(".get-a-quote-email").addClass("hide-form");
          $(".get-a-quote-message").removeClass("hide-form");
          window._conv_q = window._conv_q || [];
          _conv_q.push(["triggerConversion", "100449874"]);
          sendEvent("submitEmailCatcher", { email: formDataObject["email"] });
        }
        if (type == "exit-intent-email-catcher") {
          $(".exit-intent-success").css("display", "block");
          var delay = 1000;
          setTimeout(function () {
            $(".show-exit-intent").css("display", "none");
            window._conv_q = window._conv_q || [];
            _conv_q.push(["triggerConversion", "100449874"]);
            sendEvent("submitEmailCatcher", { email: formDataObject["email"] });
          }, delay);
        }

        if (type == "comment-Hero") {
          window._conv_q = window._conv_q || [];
          _conv_q.push(["triggerConversion", "100449874"]);
          sendEvent("submitLeadForm", { email: formDataObject["email"] });
        }
        if (type == "comment") {
          $(".get-a-quote-message").addClass("hide-form");
          $(".get-a-quote-thank-you").removeClass("hide-form");
          window._conv_q = window._conv_q || [];
          _conv_q.push(["triggerConversion", "100449874"]);
          sendEvent("submitLeadForm", { email: formDataObject["email"] });
        }
        if (type == "form-js-not-popup") {
          $(".get-a-quote-email").addClass("hide-form");
          $(".get-a-quote-thank-you").removeClass("hide-form");
          window._conv_q = window._conv_q || [];
          _conv_q.push(["triggerConversion", "100449874"]);
          sendEvent("submitLeadForm", { email: formDataObject["email"] });
        }

        leadID = response.data.leadId;
      },
      error: function (error) {},
    });
  }

  var currentFormIndex = 0;
  var totalForms = $(".hero-form-content").length;

  var allInformation = "$$";

  function showNextForm() {
    if (currentFormIndex < totalForms - 1) {
      var currentForm = $(".hero-form-content").eq(currentFormIndex);
      var nextForm = $(".hero-form-content").eq(currentFormIndex + 1);

      currentForm.fadeOut(500, function () {
        nextForm.fadeIn(500);
      });

      currentFormIndex++;
    }
  }

  $(".nextHeroForm").click(function (e) {
    e.preventDefault();
    var verifyform = false;
    var checkboxString = "";
    if ($(".hero-form-1").length > 0 && $(".hero-form-1").css("display") !== "none") {
      $('.option-block .custom-checkbox input[type="checkbox"]').each(function () {
        if ($(this).prop("checked")) {
          const checkedText = $(this).siblings(".input-text-span").text().trim();
          checkboxString += checkedText + "\n";
          $(this).prop("checked", false);
          verifyform = true;
        } else {
          $(this).siblings(".checkbox-border").addClass("invalid-input");
          $(".error-msg").css("display", "block");
        }
      });
      if (verifyform == true) {
        $(".checkbox-border").removeClass("invalid-input");
        $(".error-msg").css("display", "none");
        verifyform = false;
        allInformation += $(".hero-form-1 h5").text() + "\n" + checkboxString;
        showNextForm();
      }
    } else if ($(".hero-form-2").length > 0 && $(".hero-form-2").css("display") !== "none") {
      $('.option-block .custom-radio input[type="radio"]').each(function () {
        if ($(this).prop("checked")) {
          const checkedText = $(this).siblings(".input-text-span").text().trim();
          allInformation += "\n" + $(".hero-form-2 h5").text() + "\n" + checkedText + "\n";
          $(this).prop("checked", false);
          verifyform = true;
        } else {
          $(this).siblings(".radio-border").addClass("invalid-input");
          $(".error-msg").css("display", "block");
        }
      });
      if (verifyform == true) {
        $(".radio-border").removeClass("invalid-input");
        $(".error-msg").css("display", "none");
        verifyform = false;
        showNextForm();
      }
    } else if ($(".hero-form-3").length > 0 && $(".hero-form-3").css("display") !== "none") {
      var emailValidation = false;
      var fullnameValidation = false;

      if ($(".verify-fullname").val().length > 0) {
        formData["fullname"] = $(".options-inputs .input-box #fullname").val().trim();
        fullnameValidation = true;

        $(".verify-fullname").removeClass("invalid-input");
        $(".fullname-error").css("display", "none");
      } else {
        $(".verify-fullname").addClass("invalid-input");
        $(".fullname-error").css("display", "block");
      }

      if ($(".verify-email").val().length > 0) {
        if ($(".verify-email")[0].checkValidity()) {
          formData["email"] = $(".options-inputs .input-box #email").val().trim();
          formData["phone"] = $(".options-inputs .input-box #phone").val().trim();

          const textarea = $("#hero-text-area").val().trim();

          if (textarea) {
            allInformation = allInformation.replace("$$", "Message: " + "\n" + textarea + "\n\n");
          }
          formData["comments"] = allInformation;
          emailValidation = true;
          $(".email-error").css("display", "none");
          $(".verify-email").removeClass("invalid-input");
        } else {
          $(".verify-email").addClass("invalid-input");
          $(".error-check-valid").css("display", "block");
          $(".email-error").css("display", "none");
        }
      } else {
        $(".verify-email").addClass("invalid-input");
        $(".email-error").css("display", "block");
      }

      if (emailValidation == true && fullnameValidation == true) {
        $(".options-inputs .custom-textarea textarea").val(allInformation);
        showNextForm();
        resetForm();
        submitLead(formData, (type = "form"));
      }
    }
  });

  function resetForm() {
    $(".hero-name").val("");
    $(".hero-last").val("");
    $(".options-inputs .input-box input").val("");
    $(".options-inputs .custom-textarea textarea").val("");
    $(".verify-email").removeClass("invalid-input");
    $(".form-title").addClass("hidden-element");
    $(".error-msg").css("display", "none");
    $(".error-check-valid").css("display", "none");

    if (window.innerWidth < 768) {
      $(".hero-form-holder").addClass("hidden-border");
    }
  }
  $(".get-another-quote").click(function (e) {
    e.preventDefault();
    $(".form-title").removeClass("hidden-element");
    $(".hero-form-holder").removeClass("hidden-border");
    currentFormIndex = -1;
    if (currentFormIndex < totalForms - 1) {
      var currentForm = $(".hero-form-content").eq(currentFormIndex);
      var nextForm = $(".hero-form-content").eq(currentFormIndex + 1);

      currentForm.fadeOut(500, function () {
        nextForm.fadeIn(500);
      });

      currentFormIndex++;
    }
  });
});
