/*!
 JS-Undo-Redo
 
 Verion: 0.5
 Date: 2015-02-06
 
 Author: Laszlo Szenes
 License: MIT
 
 Implementing an undo-redo functionality to save and restore states based on data
 stored in an object, utilizing HTML5 sessionStorage
 
 LS = abbreviation for sessionStorage
 
 Copyright (c) 2015 laszlothewiz
 */

/*!
 Original source: https://github.com/laszlothewiz/JS-undo-redo
 
 Modified work: Implementing undo-redo function for WPImager using Session Storage
 
 2018 WPImager  
 https://wpimager.com/
 */

var UndoRedo;


//paramaters:
// stacksize: how many steps we can go back
// workObj: the object that will get saved/restored - given here once to avoid repetition
function undoRedo(stackSize, workObj, workObjId) {
    var stackSize = stackSize || 10;  //default is 10
    var id = (workObjId || 0).toString();
    //these are the working copies of the stacks
    //these gets saves to sessionStorage at every change
    var cvsUndo = {}; // [];      //undo stack
    var cvsRedo = {} // [];		//redo stack
    var cvslastSav = {};		//last saved state 
    var hasStorage = false;
    var L = sessionStorage; //shorthand for sessionStorage

    boot();  // startup check on sessionStorage

    function boot() {
        try {
            L.setItem("WPImagerUndoRedo", "boottest");
            L.removeItem("WPImagerUndoRedo");
            hasStorage = true;
            onStartCleanUp();
            /*            L.removeItem("crRedo" + id);
             cvsRedo.length = 0; */

        } catch (exception) {
            // hasStorage remains false
        }
    }

    function prepareCurSlide() {
        var curslide = WPImager.slide;
        if (typeof cvsUndo[curslide] == "undefined")
            cvsUndo[curslide] = [];
        if (typeof cvsRedo[curslide] == "undefined")
            cvsRedo[curslide] = [];
        if (typeof cvslastSav[curslide] == "undefined") {
            cvslastSav[curslide] = {/* canvas: JSON.parse(JSON.stringify(workObj.canvas)), */
                layer: JSON.parse(JSON.stringify(workObj.layer)),
                slides: JSON.parse(JSON.stringify(workObj.slides)),
                state: {slide: workObj.slide, current: workObj.current, console: UI.console, console_shape: UI.console_shape}
            };
            L.setItem("crlastSav" + id + '-' + curslide.toString(), JSON.stringify(cvslastSav[curslide]));
        }

    }
    function saveState() {
        var curslide = WPImager.slide;
        prepareCurSlide();
        // save state to cvslastSav, with or without changes
        if (!hasStorage)
            return;
        cvslastSav[curslide] = {/* canvas: JSON.parse(JSON.stringify(workObj.canvas)), */
            layer: JSON.parse(JSON.stringify(workObj.layer)),
            slides: JSON.parse(JSON.stringify(workObj.slides)),
            state: {slide: workObj.slide, current: workObj.current, console: UI.console, console_shape: UI.console_shape}
        };
        L.setItem("crlastSav" + id + '-' + curslide.toString(), JSON.stringify(cvslastSav[curslide]));
    }
    //adding a new value onto the stack
    function save() {
        var curslide = WPImager.slide;
        prepareCurSlide();
        if (!hasStorage)
            return;
        var mod = {l: 1}; //to track which variable need syncing to LS
        var copy = cloneObjects(workObj);
        var w = JSON.stringify(copy);
        var currObj = {/* canvas: JSON.parse(JSON.stringify(workObj.canvas)), */
            layer: JSON.parse(JSON.stringify(workObj.layer)),
            slides: JSON.parse(JSON.stringify(workObj.slides))
        };
        var currObj2 = {/* canvas: JSON.parse(JSON.stringify(workObj.canvas)), */
            layer: JSON.parse(JSON.stringify(workObj.layer)),
            slides: JSON.parse(JSON.stringify(workObj.slides))
        };
        var lastSaveObj = null;
        if (!jQuery.isEmptyObject(cvslastSav[curslide])) {
            lastSaveObj = {/* canvas: JSON.parse(JSON.stringify(cvslastSav.canvas)), */
                layer: JSON.parse(JSON.stringify(cvslastSav[curslide].layer)),
                slides: JSON.parse(JSON.stringify(cvslastSav[curslide].slides))
            };
        }
        if (lastSaveObj) {
            var hasChanges = hasLayersChanged(lastSaveObj, currObj) || hasLayersChanged(currObj, lastSaveObj);
            // (JSON.stringify(lastSaveObj.layer) !== JSON.stringify(currObj.layer))
            if (JSON.stringify(lastSaveObj.slides) !== JSON.stringify(currObj.slides))                    
            {
                hasChanges = true;
            }
            /*            if (lastSaveObj.canvas.title !== currObj.canvas.title 
             || lastSaveObj.canvas.textdir !== currObj.canvas.textdir) {
             hasChanges = true;                
             } */
            if (!hasChanges)
                return false;
        }


        if (!jQuery.isEmptyObject(cvslastSav[curslide])) {
            // process changes for redo
            detectChanges(lastSaveObj, currObj2, "ObjB");


            // process changes for undo
            detectChanges(lastSaveObj, currObj, "ObjA");
            var _u = lastSaveObj;
            var _r = currObj2; // redoObj

            /*            _u.canvas = cvslastSav.canvas; */
            _u.state = {slide: cvslastSav[curslide].state.slide, current: cvslastSav[curslide].state.current, console: cvslastSav[curslide].state.console, console_shape: cvslastSav[curslide].state.console_shape};
            /*            _r.canvas = workObj.canvas; */
            _r.state = {slide: workObj.slide, current: workObj.current, console: UI.console, console_shape: UI.console_shape};
            cvsUndo[curslide].push({u: _u, r: _r});
            if (cvsUndo[curslide].length > stackSize)
                cvsUndo[curslide].shift(); //removing the oldest one, if too many states have been saved
            mod.u = 1;
        }
        ;
        if (cvsRedo[curslide].length > 0) {
            cvsRedo[curslide].length = 0;
            mod.r = 1;
        }

        //saving a new state invalidates the redo stack
        cvslastSav[curslide] = {/* canvas: JSON.parse(JSON.stringify(workObj.canvas)), */
            layer: JSON.parse(JSON.stringify(workObj.layer)),
            slides: JSON.parse(JSON.stringify(workObj.slides)),
            state: {slide: workObj.slide, current: workObj.current, console: UI.console, console_shape: UI.console_shape}
        };

        syncLS(mod);
        return true;
    }


    function hasLayersChanged(ObjA, ObjB) {
        var curslide = WPImager.slide;
        var isDifferent = false;
        for (var k in ObjB.layer) {
            if (k >= 0 && ObjB.layer.hasOwnProperty(k)) {
                if (ObjB.layer[k].slide != curslide) {
                    // ignore other slides
                } else if (typeof ObjA.layer[k] == "undefined") {
                    isDifferent = true;
                    return true;
                } else {
                    for (var l in ObjB.layer[k]) {
                        isDifferent = false;
                        if (ObjB.layer[k].hasOwnProperty(l)) {
                            if (typeof ObjA.layer[k][l] == "object" || typeof ObjB.layer[k][l] == "object") {
                                 if (JSON.stringify(ObjA.layer[k][l]) !== JSON.stringify(ObjB.layer[k][l])) {
                                    isDifferent = true;                                     
                                    return true;
                                 }
                            } else if (ObjA.layer[k][l] == ObjB.layer[k][l]) {
                                
                            } else if (["absTop", "absBottom", "absLeft", "absRight", "temp"].indexOf(l) > -1) {
                                // ignore calculated position changes
                            } else if (ObjB.layer[k].slide == 0
                                    && ["pathPoints", "xOffset", "yOffset", "width", "height", "visible", "locked", "rotation", "fontsize", "textradius", "imgx", "imgy", "imgwidth", "imgheight", "imgrotation"].indexOf(l) > -1) {
                                // ignore shared slide common properties
                            } else if (ObjA.layer[k][l] != ObjB.layer[k][l]) {
                                isDifferent = true;
                                return true;
//                                break;
                            } else if (typeof ObjB.layer[k][l] === "function") {
                                // ignore functions
                            }
                        }

                    }
                }
            }
        }
        return isDifferent;
    }


    function detectChanges(ObjA, ObjB, modify) {
        var curslide = WPImager.slide;
        isSaving = false;

        for (var k in ObjB.layer) {
            if (k >= 0 && ObjB.layer.hasOwnProperty(k)) {
                if (ObjB.layer[k].slide != curslide) {
                    delete ObjB.layer[k];
                }
            }
        }
        for (var k in ObjA.layer) {
            if (k >= 0 && ObjA.layer.hasOwnProperty(k)) {
                if (ObjA.layer[k].slide != curslide) {
                    delete ObjA.layer[k];
                }
            }
        }
        for (var k in ObjB.layer) {
            var isDifferent = false;
            if (k >= 0 && ObjB.layer.hasOwnProperty(k)) {
                if (typeof ObjA.layer[k] == "undefined") {
                    if (modify == "ObjA") {
                        ObjA.layer[k] = {disposed: 1};
                    }
                    isDifferent = true;
                } else {
                    for (var l in ObjB.layer[k]) {
                        isDifferent = false;
                        if (ObjB.layer[k].hasOwnProperty(l)) {
                            if (ObjA.layer[k][l] == ObjB.layer[k][l]) {
                                if (modify == "ObjA") {
                                    delete ObjA.layer[k][l];
                                } else {
                                    delete ObjB.layer[k][l];
                                }
                            } else if (["absTop", "absBottom", "absLeft", "absRight", "temp"].indexOf(l) > -1) {
                                // ignore calculated position changes
                                if (modify == "ObjA") {
                                    delete ObjA.layer[k][l];
                                } else {
                                    delete ObjB.layer[k][l];
                                }
                            } else if (ObjB.layer[k].slide == 0
                                    && ["pathPoints", "xOffset", "yOffset", "width", "height", "visible", "locked", "rotation", "fontsize", "textradius", "imgx", "imgy", "imgwidth", "imgheight", "imgrotation"].indexOf(l) > -1) {
                                // ignore shared slide common properties
                                if (modify == "ObjA") {
                                    delete ObjA.layer[k][l];
                                } else {
                                    delete ObjB.layer[k][l];
                                }
                            } else if (ObjA.layer[k][l] != ObjB.layer[k][l]) {
                                if (isSaving) {
                                    //   ObjB.layer[k][l] = ObjA.layer[k][l];
                                }
                                isDifferent = true;
//                                break;
                            } else if (typeof ObjB.layer[k][l] === "function") {
                                if (modify == "ObjA") {
                                    delete ObjA.layer[k][l];
                                } else {
                                    delete ObjB.layer[k][l];
                                }
                            }
                        }

                        if (!isDifferent) {
                            if (modify == "ObjA") {
                                delete ObjA.layer[k][l];
                            } else {
                                delete ObjB.layer[k][l];
                            }
                        }
                    }
                }
            }
        }
        for (var k in ObjB.slides) {
            var isDifferent = false;
            if (k >= 0 && ObjB.slides.hasOwnProperty(k)) {
                if (typeof ObjA.slides[k] == "undefined") {
                    if (modify == "ObjA") {
                        ObjA.slides[k] = {disposed: 1};
                    }
                    isDifferent = true;
                } else {
                    for (var l in ObjB.slides[k]) {
                        isDifferent = false;
                        if (ObjB.slides[k].hasOwnProperty(l)) {
                            if (typeof ObjA.slides[k][l] == "object" || typeof ObjB.slides[k][l] == "object") {
                                 if (JSON.stringify(ObjA.slides[k][l]) !== JSON.stringify(ObjB.slides[k][l])) {
                                    isDifferent = true;                                     
                                 }                            
//                            if (l == "layer") {
//                                if (JSON.stringify(ObjA.slides[k][l]) != JSON.stringify(ObjB.slides[k][l])) {
//                                    if (isSaving) {
//                                        // ObjB.slides[k][l] = JSON.parse(JSON.stringify(ObjA.slides[k][l]));
//                                    }
//                                    isDifferent = true;
////                                    break;
//                                }
                            } else if (["disposed"].indexOf(l) > -1) {
                                // ignore disposed parameter
                                if (modify == "ObjA") {
                                    delete ObjA.slides[k][l];
                                } else {
                                    delete ObjB.slides[k][l];
                                }
                            } else if (ObjA.slides[k][l] != ObjB.slides[k][l]) {
                                if (isSaving) {
                                    // ObjB.slides[k][l] = ObjA.slides[k][l];
                                }
                                isDifferent = true;
//                                break;
                            } else if (typeof ObjB.slides[k][l] === "function") {
                                if (modify == "ObjA") {
                                    delete ObjA.slides[k][l];
                                } else {
                                    delete ObjB.slides[k][l];
                                }
                            }
                        }

                        if (!isDifferent) {
                            if (modify == "ObjA") {
                                delete ObjA.slides[k][l];
                            } else {
                                delete ObjB.slides[k][l];
                            }
                        }
                    }
                }
            }
        }

    }


    //do an restore to last saved state
    function undo() {
        var curslide = WPImager.slide;
        prepareCurSlide();
        if (!hasStorage)
            return;
        if (cvsUndo[curslide].length > 0) {
            var pop = cvsUndo[curslide].pop();
            var popUndo = JSON.parse(JSON.stringify(pop));
            if (typeof popUndo.u.layer[popUndo.u.state.current] !== "undefined"
                    && typeof popUndo.u.slides[popUndo.u.state.slide] !== "undefined") {
                for (var popSlide in popUndo.u.slides) {
                    extend(workObj.slides[popSlide], popUndo.u.slides[popSlide]);
                }
                for (var popLayer in popUndo.u.layer) {
                    extend(workObj.layer[popLayer], popUndo.u.layer[popLayer]);
                }
                /*            workObj.slide = parseInt(popUndo.r.state.slide);
                 if (workObj.slides[workObj.slide].disposed == 1) {
                 workObj.slide = parseInt(popUndo.u.state.slide);
                 } */
                workObj.current = parseInt(popUndo.r.state.current);
                if (workObj.layer[workObj.current].disposed > 0 ||
                        (workObj.current == 0 && parseInt(popUndo.u.state.current) > 0)) {
                    workObj.current = parseInt(popUndo.u.state.current);
                }

                if (typeof popUndo.r.state.console_shape !== "undefined") {
                    UI.console_shape = parseInt(popUndo.r.state.console_shape);
                }
                if (typeof popUndo.r.state.console !== "undefined") {
                    UI.console = parseInt(popUndo.r.state.console);
                }

                cvsRedo[curslide].push(popUndo);

                cvslastSav[curslide] = {/* canvas: JSON.parse(JSON.stringify(workObj.canvas)),  */
                    layer: JSON.parse(JSON.stringify(workObj.layer)),
                    slides: JSON.parse(JSON.stringify(workObj.slides)),
                    state: {slide: workObj.slide, current: workObj.current, console: UI.console, console_shape: UI.console_shape}
                };
            }

            syncLS();  //sync all
        }
    }


    //doing the redo
    function redo() {
        var curslide = WPImager.slide;
        prepareCurSlide();
        if (!hasStorage)
            return;
        if (cvsRedo[curslide].length > 0) {
            var pop = cvsRedo[curslide].pop();
            var popRedo = JSON.parse(JSON.stringify(pop));
            for (var popSlide in popRedo.r.slides) {
                extend(workObj.slides[popSlide], popRedo.r.slides[popSlide]);
            }
            for (var popLayer in popRedo.r.layer) {
                extend(workObj.layer[popLayer], popRedo.r.layer[popLayer]);
            }
            /* workObj.slide = parseInt(popRedo.r.state.slide); */
            workObj.current = parseInt(popRedo.r.state.current);
            if (typeof popRedo.r.state.console_shape !== "undefined") {
                UI.console_shape = parseInt(popRedo.r.state.console_shape);
            }
            if (typeof popRedo.r.state.console !== "undefined") {
                UI.console = parseInt(popRedo.r.state.console);
            }

            cvsUndo[curslide].push(popRedo);
            cvslastSav[curslide] = {
                /* canvas: JSON.parse(JSON.stringify(workObj.canvas)),  */
                layer: JSON.parse(JSON.stringify(workObj.layer)),
                slides: JSON.parse(JSON.stringify(workObj.slides)),
                state: {slide: workObj.slide, current: workObj.current, console: UI.console, console_shape: UI.console_shape}
            };
            syncLS();  //sync all
        }
    }


    function cloneObjects(obj) {
        if (null == obj || "object" != typeof obj)
            return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (typeof obj[attr] !== "function" && attr !== "simpleUploader" && attr !== "zipUploader" && attr !== "image" && attr !== "slides") {
                if (obj.hasOwnProperty(attr))
                    copy[attr] = obj[attr];
            }
        }
        return copy;
    }

    /*    function restoreLastSav() {
     if (!hasStorage)
     return;
     workObj.layer = {};
     //        extend(workObj, cvslastSav);
     workObj = $.extend(true, {}, workObj, cvslastSav);
     syncLS();  //sync all
     }
     */

    //clearing out the undo/redo stack
    /*    function clear() {
     if (!hasStorage)
     return;
     L.removeItem("crUndo" + id);
     L.removeItem("crRedo" + id);
     L.removeItem("crlastSav" + id);
     cvslastSav = false;
     cvsUndo.length = 0;
     cvsRedo.length = 0;
     } */

    //check if there was anything left behind from last session
    //restore record if anything was saved previously
    for (var i = 0; i < L.length; i++) {
        var varname = L.key(i);
        var slideno = 0;
        if (varname.startsWith("crUndo" + id.toString() + '-')) {
            slideno = parseInt(varname.replace("crUndo" + id.toString() + '-', ""));
            if (!isNaN(slideno)) {
                cvsUndo[slideno] = JSON.parse(L.getItem(varname));
            }

        }
        if (varname.startsWith("crRedo" + id.toString() + '-')) {
            slideno = parseInt(varname.replace("crRedo" + id.toString() + '-', ""));
            if (!isNaN(slideno)) {
                cvsRedo[slideno] = JSON.parse(L.getItem(varname));
            }
        }
        if (varname.startsWith("crlastSav" + id.toString() + '-')) {
            slideno = parseInt(varname.replace("crlastSav" + id.toString() + '-', ""));
            if (!isNaN(slideno)) {
                cvslastSav[slideno] = JSON.parse(L.getItem(varname));
            }
        }
    }



//    if (L.getItem("crlastSav" + id)) {
//        cvslastSav = JSON.parse(L.getItem("crlastSav" + id));
//        // extend(workObj,cvslastSav);  //restoring the last saved state
//        if (L.getItem("crUndo" + id))
//            cvsUndo = JSON.parse(L.getItem("crUndo" + id));  //restoring undo stack
//        if (L.getItem("crRedo" + id))
//            cvsRedo = JSON.parse(L.getItem("crRedo" + id));  //restoring redo stack
//    }


    //=========helper functions
    //special `extend` which deletes arrays in the target to accomodate restoring decreasing arrays
    function extend(target, source) {
        target = target || {};
        if (target.length + "" != "undefined") { //if it's an array
            while (target.length > 0) {  //empty the array
                target.pop();
            }
        }
        for (var prop in source) {  //do a deep copy of the object recursively
            // avoid layer object conflict in action
            if (typeof source[prop] === 'object' && prop == "layer" && typeof source["slides"] !== 'undefined') {
                for (var parm in source[prop]) {
                    var disposed = (source[prop][parm].disposed !== 0);
                    if (source[prop][parm].code == UI.LAYER.IMAGE) {
                        WPImager.createLayer("LayerImage", source[prop][parm].slide, source[prop][parm].index, disposed);
                    } else if (source[prop][parm].code == UI.LAYER.TEXT) {
                        WPImager.createLayer("LayerText", source[prop][parm].slide, source[prop][parm].index, disposed);
                    }
                }
                target[prop] = extend(target[prop], source[prop]);
            } else if (typeof source[prop] === 'object' && prop == "slides") {
                for (var parm in source[prop]) {
                    WPImager.createSlide("CanvasSlide", source[prop][parm].index);
                }
                target[prop] = extend(target[prop], source[prop]);
                /*            } else if (typeof source[prop] === 'object' && prop == "canvas") {
                 target[prop] = extend(target[prop], source[prop]); */
            } else if (typeof source[prop] === 'object') {
                target[prop] = extend(target[prop], source[prop]);
            } else {
                target[prop] = source[prop];
            }
        }
        return target;
    }

    //syncing (saving) to sessionStorage
    function syncLS(what) {
        try {
            var curslide = WPImager.slide;
            what = what || {u: 1, l: 1, r: 1};  //U=undo, L=cvslastSav, R=redo
            if (what.u)
                L.setItem("crUndo" + id + '-' + curslide.toString(), JSON.stringify(cvsUndo[curslide]));
            if (what.r)
                L.setItem("crRedo" + id + '-' + curslide.toString(), JSON.stringify(cvsRedo[curslide]));
            if (what.l)
                L.setItem("crlastSav" + id + '-' + curslide.toString(), JSON.stringify(cvslastSav[curslide]));

        } catch (e) {
            if (isQuotaExceeded(e)) {
                // Storage full remove 10 undos
                /*                var cvsUndoLength = cvsUndo.length;
                 var shiftCount = 0;
                 if (cvsUndoLength > 10) {
                 for (var i = 0; i < 10; i++) {
                 cvsUndo.shift();
                 shiftCount++;
                 cvsUndoLength = cvsUndo.length;
                 if (cvsUndoLength <= 10)
                 break;
                 }
                 }
                 if (shiftCount > 1) {
                 // retry storage sync
                 what = what || {u: 1, l: 1, r: 1};  //U=undo, L=cvslastSav, R=redo
                 if (what.u)
                 L.setItem("crUndo" + id, JSON.stringify(cvsUndo));
                 if (what.r)
                 L.setItem("crRedo" + id, JSON.stringify(cvsRedo));
                 if (what.l)
                 L.setItem("crlastSav" + id, JSON.stringify(cvslastSav));
                 } */
            }
        }
    }

    function onStartCleanUp() {
        var varname = "";
        for (var i = 0; i < L.length; i++) {
            varname = L.key(i);
            if (varname.startsWith("crUndo") && varname != "crUndo" + id.toString()) {
                L.removeItem(L.key(i));
            }
            if (varname.startsWith("crRedo") && varname != "crRedo" + id.toString()) {
                L.removeItem(L.key(i));
            }
            if (varname.startsWith("crlastSav") && varname != "crlastSav" + id.toString()) {
                L.removeItem(L.key(i));
            }
        }
    }

    function isQuotaExceeded(e) {
        var quotaExceeded = false;
        if (e) {
            if (e.code) {
                switch (e.code) {
                    case 22:
                        quotaExceeded = true;
                        break;
                    case 1014:
                        // Firefox
                        if (e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                            quotaExceeded = true;
                        }
                        break;
                }
            } else if (e.number === -2147024882) {
                // Internet Explorer 8
                quotaExceeded = true;
            }
        }
        return quotaExceeded;
    }

    return {//exposing the API functions
        saveState: saveState,
        save: save,
        undo: undo,
        redo: redo,
        prepareCurSlide: prepareCurSlide,
        /*        restoreLastSav: restoreLastSav,
         clear: clear,
         rewind: rewind, */
        countUndo: function () {
            var curslide = WPImager.slide;
            if (typeof cvsUndo[curslide] == "undefined")
                return 0;
            return cvsUndo[curslide].length;
        },
        hasUndo: function () {
            var curslide = WPImager.slide;
            if (typeof cvsUndo[curslide] == "undefined")
                return 0;
            return cvsUndo[curslide].length > 0;
        },
        hasRedo: function () {
            var curslide = WPImager.slide;
            if (typeof cvsRedo[curslide] == "undefined")
                return 0;
            return cvsRedo[curslide].length > 0;
        },
        hasLastSav: function () {
            var curslide = WPImager.slide;
            return (typeof cvslastSav[curslide] == "object");
        },
    };
}