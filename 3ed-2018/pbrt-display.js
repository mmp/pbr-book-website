
function setPBRTDisplayModeVars(displayMode)
{
    if(displayMode == 0) {
        // light mode
        document.documentElement.style.setProperty('--bg', '#fff');
        document.documentElement.style.setProperty('--bg-navbar', '#f8f9fa');
        document.documentElement.style.setProperty('--bg-cse', '#f8f9fa');
        document.documentElement.style.setProperty('--bg-table', '#fdfdfe');
        document.documentElement.style.setProperty('--bg-tooltip', '#f2f2f2');
        document.documentElement.style.setProperty('--bg-navlink-active', '#eee');
        document.documentElement.style.setProperty('--border-color', 'rgba(0, 0 , 0, 0.125)');
        document.documentElement.style.setProperty('--link', '#355090');
        document.documentElement.style.setProperty('--link-active', 'blue');
        document.documentElement.style.setProperty('--table-outline', '#dee2e6');
        document.documentElement.style.setProperty('--text', '#000');
        document.documentElement.style.setProperty('--text-navbar', 'rgb(0, 0, 0, 0.5)');
        document.documentElement.style.setProperty('--fig-outline', '#404040');
        document.documentElement.style.setProperty('--legend', '#000');
        document.documentElement.style.setProperty('--footnote-btn', '#6080e0');
        document.documentElement.style.setProperty('--footnote-btn-bg', '#fff');
        document.documentElement.style.setProperty('--icon', 'url(/3ed-2018/light.svg)');
    } else if(displayMode == 1) {
        // dark mode
        document.documentElement.style.setProperty('--bg', '#3a3a3a');
        document.documentElement.style.setProperty('--bg-navbar', '#343434');
        document.documentElement.style.setProperty('--bg-cse', '#343434');
        document.documentElement.style.setProperty('--bg-table', '#383838');
        document.documentElement.style.setProperty('--bg-tooltip', '#444444');
        document.documentElement.style.setProperty('--bg-navlink-active', '#444');
        document.documentElement.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.125)');
        document.documentElement.style.setProperty('--link', '#7186ac');
        document.documentElement.style.setProperty('--link-active', 'blue');
        document.documentElement.style.setProperty('--table-outline', '#636363');
        document.documentElement.style.setProperty('--text', '#acacac');
        document.documentElement.style.setProperty('--text-navbar', 'rgb(172, 172, 172, 0.75)');
        document.documentElement.style.setProperty('--fig-outline', '#404040');
        document.documentElement.style.setProperty('--legend', '#acacac');
        document.documentElement.style.setProperty('--footnote-btn', '#6080e0');
        document.documentElement.style.setProperty('--footnote-btn-bg', '#3a3a3a');
        document.documentElement.style.setProperty('--icon', 'url(/3ed-2018/dark.svg)');
    }

    document.documentElement.style.setProperty('--landing-title', '#eee');
    document.documentElement.style.setProperty('--text-midred', '#a00000');
    document.documentElement.style.setProperty('--text-red', '#ff0000');
}

function setPBRTDisplayMode()
{
    var displayMode = localStorage.getItem("displayMode");
    if(displayMode == "null") {
        displayMode = 0; // no stored display mode, default to light mode
        localStorage.setItem("displayMode", displayMode);
    }
    setPBRTDisplayModeVars(displayMode);
}

function TogglePBRTDisplayMode()
{
    var displayMode = localStorage.getItem("displayMode");
    if(displayMode == 0) displayMode = 1;
    else if(displayMode == 1) displayMode = 0;
    localStorage.setItem("displayMode", displayMode); // update the stored display mode
    setPBRTDisplayModeVars(displayMode);
}

setPBRTDisplayMode();