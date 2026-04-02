/**
 * Memos API Proxy for Cloudflare Workers
 * 
 * Environment variables:
 * - MEMOS_BASE_URL: Memos upstream URL (e.g. https://your-memos.example.com)
 * - MEMOS_TOKEN: Memos API Token
 */

export default {
  async fetch(request, env) {
    const MEMOS_BASE_URL = env.MEMOS_BASE_URL || '';
    const MEMOS_TOKEN = env.MEMOS_TOKEN || '';

    if (!MEMOS_BASE_URL || !MEMOS_TOKEN) {
      return new Response(JSON.stringify({
        error: '请配置环境变量 MEMOS_BASE_URL 和 MEMOS_TOKEN'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // 测试端点
    if (pathname === '/test') {
      return new Response(JSON.stringify({
        envConfigured: true,
        MEMOS_BASE_URL: '已配置',
        MEMOS_TOKEN: MEMOS_TOKEN ? '已配置' : '未配置'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 静态资源直接透传（重要！）
    if (pathname.startsWith('/file/') || pathname.startsWith('/assets/') || pathname.startsWith('/uploads/')) {
      const targetUrl = `${MEMOS_BASE_URL}${pathname}${url.search}`;
      return fetch(targetUrl);
    }

    // API 代理
    const targetUrl = `${MEMOS_BASE_URL}${pathname}${url.search}`;
    
    const headers = new Headers();
    headers.set('Authorization', `Bearer ${MEMOS_TOKEN}`);
    headers.set('Content-Type', 'application/json');
    // 移除可能导致问题的 header
    headers.delete('cf-connecting-ip');
    headers.delete('cf-ray');

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined,
        redirect: 'follow'
      });

      const responseText = await response.text();
      
      // 过滤只保留 PUBLIC
      if (pathname.startsWith('/api/v1/memos') && response.ok) {
        try {
          const data = JSON.parse(responseText);
          if (data.memos && Array.isArray(data.memos)) {
            data.memos = data.memos.filter(memo => memo.visibility === 'PUBLIC');
            return new Response(JSON.stringify(data), { status: response.status, headers: corsHeaders });
          }
        } catch (e) {}
      }

      return new Response(responseText, {
        status: response.status,
        headers: { ...corsHeaders, ...Object.fromEntries(response.headers) }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};
