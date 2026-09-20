import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '../../theme/colors';
import { prepareLessonHtml, getTopicsQuizRows } from '../../utils/lessonHtmlEnhancer';
import { stripTopicsSection } from '../../utils/topicsQuizTable';
import { YOUTUBE_REFERER_ORIGIN } from '../../utils/mediaUrl';
import TopicsQuizTable from '../TopicsQuizTable/TopicsQuizTable';
import { styles } from './LessonHtmlContent.styles';

const BASE_URL = 'https://bridge-academy.vn';

const LESSON_CSS = `
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 0 0 8px;
    color: #1F2937;
    line-height: 1.65;
    font-size: 15px;
    word-wrap: break-word;
    text-align: left;
    text-indent: 0;
    background-color: #FFFFFF;
  }
  html {
    background-color: #FFFFFF;
  }
  p, div, span, li, td, th {
    text-align: left;
    text-indent: 0 !important;
  }
  .justify-text,
  .text-justify {
    text-align: left !important;
    text-indent: 0 !important;
  }
  .lesson-highlight {
    display: inline;
    color: #0f2a6e !important;
    background: #EAF0FB;
    border-left: 3px solid #0f2a6e;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 700;
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
  }
  p.lesson-highlight {
    display: block;
    padding: 10px 12px;
    margin: 12px 0;
  }
  img {
    max-width: 100%;
    width: 100%;
    height: auto !important;
    border-radius: 8px;
    margin: 8px auto 4px;
    display: block;
    object-fit: contain;
    background-color: #F3F4F6;
    /* Reserve space so late-loading images do not shove content and skip the scroll. */
    min-height: 160px;
    aspect-ratio: 4 / 3;
  }
  img[data-loaded="1"] {
    min-height: 0;
    aspect-ratio: auto;
  }
  figure { margin: 16px 0; }
  figcaption,
  p.caption {
    font-size: 13px;
    color: #6B7280;
    margin: 4px 0 8px;
    line-height: 1.4;
    text-align: center;
  }
  table {
    width: 100% !important;
    max-width: 100%;
    border-collapse: collapse;
    margin: 0;
    font-size: 14px;
  }
  table.field-table {
    table-layout: auto;
    margin: 8px 0 16px;
  }
  table.field-table tr,
  table.field-table td,
  table.field-table th {
    height: auto !important;
    min-height: 0;
    overflow: visible;
    white-space: normal;
  }
  table.field-table td:first-child {
    width: 34%;
    min-width: 96px;
    font-weight: 700;
    color: #000080;
    vertical-align: top;
    background: #edf0f2;
  }
  table.field-table td:last-child {
    width: 66%;
    vertical-align: top;
  }
  table.topics-table {
    table-layout: fixed;
  }
  .table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    margin: 16px 0;
  }
  table.lesson-table {
    border: 1px solid #D1D5DB;
    border-radius: 8px;
    overflow: hidden;
  }
  table.topics-table th,
  table.topics-table td {
    border: 1px solid #D1D5DB;
    padding: 10px 8px;
    vertical-align: middle;
    word-wrap: break-word;
    overflow-wrap: anywhere;
    line-height: 1.35;
  }
  table.topics-table .col-no {
    width: 14%;
    min-width: 44px;
    text-align: center;
    font-weight: 700;
    color: #0f2a6e;
    background: #E8EEF5;
  }
  table.topics-table .col-topic {
    width: 64%;
    text-align: left;
    color: #1A2E4C;
    font-weight: 600;
  }
  table.topics-table .col-quiz {
    width: 22%;
    min-width: 52px;
    text-align: center;
    font-weight: 700;
    color: #0f2a6e;
  }
  table.topics-table thead th {
    background: #f7cfad;
    color: #1A2E4C;
    font-weight: 700;
    text-align: center;
  }
  table.topics-table thead th.col-topic {
    text-align: center;
  }
  table.topics-table tbody tr:nth-child(even) td {
    background: #edf0f2;
  }
  table.topics-table tbody tr:nth-child(odd) td.col-topic {
    background: #F8FAFC;
  }
  table.topics-table tbody tr:nth-child(odd) td.col-no,
  table.topics-table tbody tr:nth-child(odd) td.col-quiz {
    background: #E8EEF5;
  }
  table.topics-table td p {
    margin: 0;
  }
  strong {
    font-weight: 700;
  }
  th, td {
    border: 1px solid #D1D5DB;
    padding: 10px 12px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background: #E8EEF5;
    color: #1A2E4C;
    font-weight: 600;
  }
  tr:nth-child(even) td { background: #F8FAFC; }
  iframe, video {
    max-width: 100%;
    width: 100%;
    border: none;
    border-radius: 8px;
    margin: 12px 0;
    min-height: 200px;
    aspect-ratio: 16 / 9;
  }
  audio { width: 100%; margin: 12px 0; }
  a { color: #2563EB; text-decoration: none; }
  u, ins {
    text-decoration: none !important;
  }
  span[style*="underline"],
  p[style*="underline"] {
    text-decoration: none !important;
  }
  h1, h2, h3, h4 {
    color: #1A2E4C;
    line-height: 1.3;
    margin: 16px 0 8px;
  }
  h3 + .table-wrap,
  h3 + table {
    margin-top: 4px;
  }
  p { margin: 0 0 12px; }
  ul, ol { margin: 0 0 12px; padding-left: 22px; }
  li { margin-bottom: 6px; }
  blockquote {
    margin: 12px 0;
    padding: 10px 14px;
    border-left: 4px solid #0f2a6e;
    background: #EAF0FB;
    border-radius: 0 8px 8px 0;
  }
  .flex-container-course-right,
  .flex-container-course-row,
  .flex-container-course-left,
  .flex-container-course-center,
  .lesson-block,
  .lesson-row {
    display: block;
    width: 100%;
    margin: 12px 0;
  }
  .image-caption-wrapper {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    text-align: center;
  }
  .text-wrapper {
    width: 100%;
    min-width: 0;
  }
`;

const HEIGHT_SCRIPT = `
  (function () {
    var pending = null;
    var lastPosted = 0;

    function measureHeight() {
      var body = document.body;
      var marker = document.getElementById('lesson-end');
      if (marker) {
        var bodyRect = body.getBoundingClientRect();
        var markerRect = marker.getBoundingClientRect();
        return Math.ceil(markerRect.bottom - bodyRect.top);
      }
      return Math.max(body.scrollHeight, body.offsetHeight);
    }

    function postHeightNow() {
      var next = Math.max(measureHeight(), 40);
      // Ignore tiny fluctuations that cause flicker / scroll jumps.
      if (Math.abs(next - lastPosted) < 8) return;
      lastPosted = next;
      window.ReactNativeWebView.postMessage(String(next));
    }

    function postHeight() {
      if (pending) return;
      pending = setTimeout(function () {
        pending = null;
        postHeightNow();
      }, 80);
    }

    function prepareImage(img) {
      if (!img || img.__baPrepared) return;
      img.__baPrepared = true;

      function applyNaturalSize() {
        img.setAttribute('data-loaded', '1');
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          var parentW = (img.parentElement && img.parentElement.clientWidth) || window.innerWidth || 320;
          var w = Math.min(parentW, img.naturalWidth);
          var h = Math.round(w * (img.naturalHeight / img.naturalWidth));
          if (h > 0) {
            img.style.minHeight = h + 'px';
            img.style.aspectRatio = img.naturalWidth + ' / ' + img.naturalHeight;
          }
        }
        postHeight();
      }

      if (img.complete && img.naturalWidth > 0) {
        applyNaturalSize();
      } else {
        img.addEventListener('load', applyNaturalSize);
        img.addEventListener('error', function () {
          img.setAttribute('data-loaded', '1');
          postHeight();
        });
      }
    }

    function prepareAllImages() {
      Array.from(document.images || []).forEach(prepareImage);
    }

    postHeight();
    prepareAllImages();
    window.addEventListener('load', function () {
      prepareAllImages();
      postHeight();
    });

    if (typeof MutationObserver !== 'undefined') {
      new MutationObserver(function () {
        prepareAllImages();
        postHeight();
      }).observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    setTimeout(postHeight, 120);
    setTimeout(postHeight, 600);
    setTimeout(postHeight, 1600);
  })();
  true;
`;

function absolutizeUrls(html = '') {
  return html
    .replace(/\ssrc="\/([^"]+)"/gi, ` src="${BASE_URL}/$1"`)
    .replace(/\shref="\/([^"]+)"/gi, ` href="${BASE_URL}/$1"`)
    .replace(/\ssrc="(?!https?:\/\/|data:)([^"]+)"/gi, ` src="${BASE_URL}/$1"`)
    .replace(/\shref="(?!https?:\/\/|mailto:|tel:|#)([^"]+)"/gi, ` href="${BASE_URL}/$1"`);
}

function wrapHtmlDocument(body = '') {
  const safeBody = absolutizeUrls(body);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta name="referrer" content="strict-origin-when-cross-origin" />
  <style>${LESSON_CSS}</style>
</head>
<body>${safeBody}<div id="lesson-end" style="height:1px;width:100%"></div></body>
</html>`;
}

export default function LessonHtmlContent({ html, text, textStyle }) {
  const [webHeight, setWebHeight] = useState(280);
  const [loading, setLoading] = useState(Boolean(html?.trim() || text?.trim()));

  const topicsRows = useMemo(() => getTopicsQuizRows(html, text), [html, text]);

  const source = useMemo(() => {
    const prepared = prepareLessonHtml(html, text);
    if (!prepared?.trim()) return null;
    return {
      html: wrapHtmlDocument(prepared),
      baseUrl: YOUTUBE_REFERER_ORIGIN,
    };
  }, [html, text]);

  useEffect(() => {
    setWebHeight(280);
    setLoading(Boolean(source));
  }, [source]);

  const onMessage = useCallback((event) => {
    const next = Number(event.nativeEvent.data);
    if (!(next > 0)) return;
    const padded = Math.min(Math.max(next + 32, 80), 12000);
    // Only grow (or tiny shrink) so image loads do not collapse/jump the page mid-scroll.
    setWebHeight((prev) => {
      if (padded >= prev) return padded;
      if (prev - padded < 24) return padded;
      return prev;
    });
  }, []);

  if (!topicsRows.length && !source) {
    const stripped = stripTopicsSection(text || '');
    if (stripped?.trim()) {
      return <Text style={[styles.plainText, textStyle]}>{stripped}</Text>;
    }
    return null;
  }

  return (
    <View style={styles.wrap}>
      {topicsRows.length ? <TopicsQuizTable rows={topicsRows} /> : null}

      {source ? (
        <>
          {loading && (
            <View style={styles.loader}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}
          <WebView
            originWhitelist={['*']}
            source={source}
            style={[styles.webview, { height: webHeight }]}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            onMessage={onMessage}
            injectedJavaScript={HEIGHT_SCRIPT}
            onLoadEnd={() => setLoading(false)}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
            mixedContentMode="always"
            setSupportMultipleWindows={false}
            androidLayerType="hardware"
          />
        </>
      ) : null}
    </View>
  );
}
