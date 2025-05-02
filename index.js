// ==UserScript==
// @name     Get out from X -今すぐXから立ち去れ-
// @namespace http://tampermonkey.net/
// @version   2025-05-02
// @description You can't get into X anymore. please logout from x.com
// @author    masavo
// @match     https://x.com/*
// @icon      https://www.google.com/s2/favicons?sz=64&domain=x.com
// @grant     none
// ==/UserScript==

(function () {
  "use strict";

  class DOMObserver {
    constructor(root) {
      this.reactRoot = root?.querySelector("#react-root") || null;
    }

    #isValidElement(node, targetSelector) {
      return node instanceof HTMLElement && node.querySelector(targetSelector);
    }

    #getTargetElement(node, targetSelector) {
      const element = node.querySelector(targetSelector);
      return element instanceof HTMLElement ? element : null;
    }

    #handleMutations(mutations, targetSelector, callback) {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (this.#isValidElement(node, targetSelector)) {
            const element = this.#getTargetElement(node, targetSelector);
            if (element) {
              callback(element);
            }
          }
        });
      });
    }

    #setupObserver(parentElement, targetSelector, callback, options) {
      const observer = new MutationObserver((mutations) => {
        this.#handleMutations(mutations, targetSelector, callback);
      });

      if (parentElement) {
        observer.observe(parentElement, options);
      }
    }

    observeElementAppendedTiming(
      targetSelector,
      parentSelector,
      callback,
      options = { childList: true, subtree: true }
    ) {
      const parentElement = document.querySelector(parentSelector);
      this.#setupObserver(parentElement, targetSelector, callback, options);
    }
  }

  class SignInContainerManager {
    constructor(domObserver) {
      this.domObserver = domObserver;
    }

    observe(callback) {
      this.domObserver.observeElementAppendedTiming(
        '[data-testid="google_sign_in_container"]',
        "#react-root",
        (element) => callback(element)
      );
    }

    remove(container) {
      if (container && container.parentNode) {
        container.parentNode.remove();
        console.log("Sign In Container を削除しました。");
      }
    }
  }

  class TextBoxManager {
    constructor(domObserver) {
      this.domObserver = domObserver;
      this.texts = [
        "お前の居場所は、ここではない。",
        "今すぐここから立ち去りなさい。",
      ];
    }

    observe(callback) {
      this.domObserver.observeElementAppendedTiming(
        'div[dir="ltr"] > span',
        "#react-root",
        (element) => callback(element)
      );
    }

    overwrite(element, newText) {
      if (element) {
        element.textContent = newText;
        console.log(`要素のテキストを上書きしました: ${newText}`, element);
      }
    }

    overwriteAll(element) {
      this.targetElements(element).forEach((targetElement, index) => {
        if (this.texts[index]) {
          this.overwrite(targetElement, this.texts[index]);
        }
      });
    }

    targetElements(element) {
      return element.querySelectorAll('div[dir="ltr"] > span');
    }
  }

  // 処理
  const domObserver = new DOMObserver(document);
  const signInContainerManager = new SignInContainerManager(domObserver);
  signInContainerManager.observe((element) => {
    signInContainerManager.remove(element);
  });

  const textBoxManager = new TextBoxManager(domObserver);
  textBoxManager.observe((element) => {
    textBoxManager.overwriteAll(element);
  });
})();
