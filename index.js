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

  // 上書きするテキストの情報を配列で定義します。
  const texts = [
    "お前の居場所は、ここではない。",
    "今すぐここから立ち去りなさい。",
  ];

  function overwriteText(element, newText) {
    if (element) {
      element.textContent = newText;
      console.log(`要素のテキストを上書きしました: ${newText}`, element);
    }
  }

  function processTargetElements(element) {
    const targetElements = element.querySelectorAll('div[dir="ltr"] > span');
    targetElements.forEach((targetElement, index) => {
      if (texts[index]) {
        overwriteText(targetElement, texts[index]);
      }
    });
  }

  function removeGoogleSignInContainer(googleSignInContainer) {
    if (googleSignInContainer && googleSignInContainer.parentNode) {
      googleSignInContainer.parentNode.remove();
      console.log("Google Sign In Container を削除しました。");
    }
  }

  const domObserver = new DOMObserver(document);

  // テキストの変更を監視する
  domObserver.observeElementAppendedTiming(
    'div[dir="ltr"] > span',
    "#react-root",
    (element) => {
      const targetContainers = document.querySelectorAll("#react-root > div");
      targetContainers.forEach((container) => {
        processTargetElements(container);
      });
    }
  );

  // Google Sign In Container の削除を監視する
  domObserver.observeElementAppendedTiming(
    '[data-testid="google_sign_in_container"]',
    "#react-root",
    (element) => {
      removeGoogleSignInContainer(element);
    }
  );
})();
