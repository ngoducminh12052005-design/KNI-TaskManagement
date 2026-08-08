import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const authHeader = req.headers.get("Authorization")
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader ?? "" } } }
    )
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Chưa đăng nhập" }), { status: 401, headers: corsHeaders })
    }

    const { employeeName, rewardName, cost } = await req.json()
    if (!employeeName || !rewardName) {
      return new Response(JSON.stringify({ error: "Thiếu thông tin" }), { status: 400, headers: corsHeaders })
    }

    // TODO: khi domain đã xác thực trong Resend, đổi danh sách này thành email IT/HR thật
    const recipients = ["ngoducminh12052005@gmail.com"]

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: recipients,
        subject: `🎁 ${employeeName} vừa đổi quà: ${rewardName}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Có nhân viên vừa đổi quà</h2>
            <p><strong>${employeeName}</strong> vừa dùng <strong>${cost} điểm</strong> để đổi lấy: <strong>${rewardName}</strong></p>
            <p style="color:#888; font-size:12px;">Email tự động từ hệ thống KNI Task Management</p>
          </div>
        `,
      }),
    })

    if (!emailRes.ok) {
      const errText = await emailRes.text()
      return new Response(JSON.stringify({ error: "Gửi email thất bại: " + errText }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders })
  }
})