function allConsentGranted() {
  gtag('consent', 'update', {
    'ad_user_data': 'granted',
    'ad_personalization': 'granted',
    'ad_storage': 'granted',
    'analytics_storage': 'granted'
  });
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

document.addEventListener('DOMContentLoaded', function() {
  // Cookies Consent
  let gaCookie = getCookie("cookie-consent");
  if (gaCookie != "") {
    allConsentGranted();
    return;
  } else {
    document.getElementById("cookie-consent").classList.remove("hidden");
    // If the user clicks the consent button then remove the class show from the cookie consent div
    document.getElementById("accept-cookies").addEventListener("click", function() {
      document.getElementById("cookie-consent").classList.add("hidden");
      // then add a cookie to the user session to remember that the user has consented
      setCookie("cookie-consent", "true", 365);
      allConsentGranted();
    });
    return;
  }
});