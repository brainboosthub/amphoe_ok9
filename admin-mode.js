(() => {
  'use strict';
  const API_URL='https://script.google.com/macros/s/AKfycbxvqWwNRKu5GpoVRyDZGdwXRy6ubEgPAg2-stv-G-arF4HRoqkAfP21oTl124ne6CvZ/exec';
  const CSS_FILES=['edit-website.css?v=20260826-1','news-manager.css?v=20260826-1','newsletter-manager.css?v=20260826-1','newsletter-overlay.css?v=20260826-3','facebook-manager.css?v=20260826-1'];
  const JS_FILES=['edit-website.js?v=20260826-1','news-manager.js?v=20260826-1','newsletter-manager.js?v=20260826-4','facebook-manager.js?v=20260826-2'];
  let toolsPromise=null;
  const $=id=>document.getElementById(id);
  async function api(payload){const response=await fetch(API_URL,{method:'POST',cache:'no-store',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});if(!response.ok)throw new Error(`HTTP ${response.status}`);const result=await response.json();if(!result.success)throw new Error(result.message||'ดำเนินการไม่สำเร็จ');return result}
  function loadStyle(href){return new Promise((resolve,reject)=>{if(document.querySelector(`link[data-admin-tool="${href}"]`))return resolve();const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.adminTool=href;link.onload=resolve;link.onerror=()=>reject(new Error('โหลด '+href+' ไม่สำเร็จ'));document.head.appendChild(link)})}
  function loadScript(src){return new Promise((resolve,reject)=>{if(document.querySelector(`script[data-admin-tool="${src}"]`))return resolve();const script=document.createElement('script');script.src=src;script.dataset.adminTool=src;script.onload=resolve;script.onerror=()=>reject(new Error('โหลด '+src+' ไม่สำเร็จ'));document.body.appendChild(script)})}
  function loadAdminTools(){if(toolsPromise)return toolsPromise;toolsPromise=(async()=>{await Promise.all(CSS_FILES.map(loadStyle));for(const src of JS_FILES)await loadScript(src)})();return toolsPromise}
  function setAdminUi(enabled){document.body.classList.toggle('admin-edit-mode',enabled);$('adminLoginButton').hidden=enabled;$('adminLogoutButton').hidden=!enabled}
  async function activateAdmin(){await loadAdminTools();setAdminUi(true);$('adminLoginModal').hidden=true}
  function openLogin(){ $('adminLoginStatus').textContent='';$('adminLoginModal').hidden=false;setTimeout(()=>$('adminUsername').focus(),30) }
  function closeLogin(){ $('adminLoginModal').hidden=true }
  $('adminLoginButton').addEventListener('click',openLogin);$('adminLoginClose').addEventListener('click',closeLogin);$('adminLoginModal').addEventListener('click',e=>{if(e.target===$('adminLoginModal'))closeLogin()});
  $('adminLoginForm').addEventListener('submit',async event=>{event.preventDefault();const status=$('adminLoginStatus'),submit=$('adminLoginSubmit');status.textContent='';submit.disabled=true;submit.textContent='กำลังตรวจสอบ...';try{const result=await api({mode:'adminlogin',username:$('adminUsername').value.trim(),password:$('adminPassword').value});sessionStorage.setItem('mysiteAdminToken',result.token);sessionStorage.setItem('mysiteAdminName',result.username||'Admin');submit.textContent='กำลังโหลดเครื่องมือ...';await activateAdmin()}catch(error){sessionStorage.removeItem('mysiteAdminToken');status.textContent=error.message}finally{submit.disabled=false;submit.textContent='เข้าสู่ระบบ'}});
  $('adminForgotButton').addEventListener('click',async()=>{const modal=await Swal.fire({title:'ลืมรหัสผ่าน',input:'email',inputLabel:'กรอก Email ที่ลงทะเบียนไว้',showCancelButton:true,confirmButtonText:'ส่งข้อมูลเข้าสู่ Email',cancelButtonText:'ยกเลิก',confirmButtonColor:'#dc2626',inputValidator:value=>!value?'กรุณากรอก Email':undefined});if(!modal.isConfirmed)return;Swal.fire({title:'กำลังส่ง Email...',allowOutsideClick:false,didOpen:()=>Swal.showLoading()});try{await api({mode:'adminforgot',email:modal.value.trim()});Swal.fire({icon:'success',title:'ส่ง Email แล้ว',text:'กรุณาตรวจสอบกล่องจดหมายและจดหมายขยะ'})}catch(error){Swal.fire({icon:'error',title:'ส่งไม่สำเร็จ',text:error.message})}});
  $('adminTogglePassword').addEventListener('click',event=>{const input=$('adminPassword');input.type=input.type==='password'?'text':'password';event.currentTarget.querySelector('i').className=input.type==='password'?'fa-solid fa-eye':'fa-solid fa-eye-slash'});
  $('adminLogoutButton').addEventListener('click',()=>{sessionStorage.removeItem('mysiteAdminToken');sessionStorage.removeItem('mysiteAdminName');setAdminUi(false);if(window.Swal)Swal.close()});
  const existingToken=sessionStorage.getItem('mysiteAdminToken');
  if(existingToken){
    api({mode:'editwebsite',editor:'text',token:existingToken})
      .then(()=>loadAdminTools())
      .then(()=>setAdminUi(true))
      .catch(()=>{sessionStorage.removeItem('mysiteAdminToken');sessionStorage.removeItem('mysiteAdminName');setAdminUi(false)});
  }else setAdminUi(false);
})();
