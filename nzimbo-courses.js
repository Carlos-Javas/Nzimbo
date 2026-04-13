/* ═══════════════════════════════════════════════════════════
   NZIMBO — COURSES & PRODUCTS  (Supabase)
   ═══════════════════════════════════════════════════════════ */
'use strict';

const NzimboCourses = {

    const sb = await waitSB();

  /* ─── COURSES ─────────────────────────────────────────── */

  /** Todos os cursos publicados (para explorar) */
  async getPublished(filters) {
    const sb = await waitSB();
    let q = sb.from('courses')
      .select('*, profiles(first_name,last_name,avatar_url)')
      .eq('status','published')
      .order('created_at', { ascending: false });
    if (filters?.category) q = q.eq('category', filters.category);
    if (filters?.search)   q = q.ilike('title', `%${filters.search}%`);
    if (filters?.maxPrice) q = q.lte('price', filters.maxPrice);
    const { data, error } = await q;
    if (error) { console.error(error); return []; }
    return data || [];
  },

  /** Curso por ID (com módulos e aulas) */
  async getCourse(id) {
    const sb = await waitSB();
    const { data: course, error } = await sb.from('courses')
      .select('*, profiles(first_name,last_name,avatar_url)')
      .eq('id', id).single();
    if (error || !course) return null;
    // Módulos
    const { data: modules } = await sb.from('modules')
      .select('*').eq('course_id', id).order('position');
    // Aulas
    const { data: lessons } = await sb.from('lessons')
      .select('*').eq('course_id', id).order('position');
    // Agrupar
    course.modules = (modules || []).map(m => ({
      ...m,
      lessons: (lessons || []).filter(l => l.module_id === m.id)
    }));
    course.instructor = course.profiles ? `${course.profiles.first_name} ${course.profiles.last_name||''}`.trim() : 'Criador';
    course.instructorAvatar = course.profiles?.avatar_url || (course.profiles?.first_name?.[0]||'C');
    return course;
  },

  /** Cursos do criador autenticado */
  async getMyCourses() {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return [];
    const { data, error } = await sb.from('courses')
      .select('*, modules(id, title, lessons(id))')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  /** Criar ou atualizar curso */
  async saveCourse(data) {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) throw new Error('Não autenticado');
    const payload = {
      title: data.title, description: data.description, category: data.category,
      level: data.level, price: parseFloat(data.price)||0,
      old_price: parseFloat(data.oldPrice)||0, status: data.status||'draft',
      thumbnail_url: data.thumbnail||'', creator_id: user.id,
      updated_at: new Date().toISOString()
    };
    if (data.id) {
      const { data: r, error } = await sb.from('courses').update(payload).eq('id',data.id).eq('creator_id',user.id).select().single();
      if (error) throw sbErr(error);
      return r;
    } else {
      const { data: r, error } = await sb.from('courses').insert(payload).select().single();
      if (error) throw sbErr(error);
      return r;
    }
  },

  async publishCourse(id) {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return;
    await sb.from('courses').update({ status:'published', updated_at: new Date().toISOString() }).eq('id',id).eq('creator_id',user.id);
  },

  async deleteCourse(id) {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return;
    // Libertar storage
    const { data: lessons } = await sb.from('lessons').select('file_size').eq('course_id',id);
    const total = (lessons||[]).reduce((s,l)=>s+(l.file_size||0),0);
    if (total > 0) await NzimboAuth.freeStorage(total);
    await sb.from('courses').delete().eq('id',id).eq('creator_id',user.id);
  },

  /* ─── MODULES & LESSONS ───────────────────────────────── */

  async saveModule(courseId, data) {
    const sb = await waitSB();
    const payload = { course_id: courseId, title: data.title, position: data.position||0 };
    if (data.id) {
      const { data:r, error } = await sb.from('modules').update(payload).eq('id',data.id).select().single();
      if (error) throw sbErr(error); return r;
    } else {
      const { data:r, error } = await sb.from('modules').insert(payload).select().single();
      if (error) throw sbErr(error); return r;
    }
  },

  async saveLesson(courseId, moduleId, data) {
    const sb = await waitSB();
    const payload = {
      course_id: courseId, module_id: moduleId,
      title: data.title, duration: data.duration||'', video_url: data.videoUrl||'',
      is_free: !!data.isFree, position: data.position||0, file_size: data.fileSize||0
    };
    if (data.id) {
      const { data:r, error } = await sb.from('lessons').update(payload).eq('id',data.id).select().single();
      if (error) throw sbErr(error); return r;
    } else {
      const { data:r, error } = await sb.from('lessons').insert(payload).select().single();
      if (error) throw sbErr(error); return r;
    }
  },

  async deleteLesson(id, fileSize) {
    const sb = await waitSB();
    if (fileSize > 0) await NzimboAuth.freeStorage(fileSize);
    await sb.from('lessons').delete().eq('id',id);
  },

  /* ─── ENROLLMENT & PROGRESS ───────────────────────────── */

  async enrollCourse(courseId) {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return false;
    const { error } = await sb.from('enrollments').upsert({ user_id: user.id, course_id: courseId }, { onConflict: 'user_id,course_id' });
    return !error;
  },

  async isEnrolled(courseId) {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return false;
    const { data } = await sb.from('enrollments').select('id').eq('user_id',user.id).eq('course_id',courseId).maybeSingle();
    return !!data;
  },

  async getMyEnrollments() {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return [];
    const { data } = await sb.from('enrollments')
      .select('*, courses(id,title,category,instructor:profiles(first_name,last_name),thumbnail_url)')
      .eq('user_id', user.id).order('enrolled_at',{ascending:false});
    return data || [];
  },

  async getProgress(courseId) {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return null;
    const { data } = await sb.from('progress').select('lesson_id').eq('user_id',user.id).eq('course_id',courseId);
    const completed = (data||[]).map(r=>r.lesson_id);
    // Total lessons
    const { count } = await sb.from('lessons').select('id',{count:'exact',head:true}).eq('course_id',courseId);
    const pct = count > 0 ? Math.round((completed.length/count)*100) : 0;
    return { completedLessons: completed, percent: pct };
  },

  async markLesson(courseId, lessonId) {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return;
    await sb.from('progress').upsert({ user_id:user.id, course_id:courseId, lesson_id:lessonId }, { onConflict:'user_id,lesson_id' });
  },

  /* ─── PRODUCTS ────────────────────────────────────────── */

  async getPublishedProducts(filters) {
    const sb = await waitSB();
    let q = sb.from('products')
      .select('*, profiles(first_name,last_name)')
      .eq('status','published')
      .order('created_at',{ascending:false});
    if (filters?.category) q = q.eq('category',filters.category);
    if (filters?.type)     q = q.eq('type',filters.type);
    if (filters?.search)   q = q.ilike('title',`%${filters.search}%`);
    const { data, error } = await q;
    if (error) return [];
    return data||[];
  },

  async getProduct(id) {
    const sb = await waitSB();
    const { data, error } = await sb.from('products')
      .select('*, profiles(first_name,last_name,avatar_url)').eq('id',id).single();
    if (error) return null;
    if (data.profiles) data.instructor = `${data.profiles.first_name} ${data.profiles.last_name||''}`.trim();
    return data;
  },

  async getMyProducts() {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return [];
    const { data, error } = await sb.from('products').select('*').eq('creator_id',user.id).order('created_at',{ascending:false});
    if (error) return [];
    return data||[];
  },

  async saveProduct(data) {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) throw new Error('Não autenticado');
    const payload = {
      title: data.title, description: data.description, category: data.category,
      type: data.type||'ebook', price: parseFloat(data.price)||0,
      old_price: parseFloat(data.oldPrice)||0, status: data.status||'draft',
      thumbnail_url: data.thumbnail||'', file_url: data.fileUrl||'',
      file_size: data.fileSize||0, creator_id: user.id,
      updated_at: new Date().toISOString()
    };
    if (data.id) {
      const { data:r, error } = await sb.from('products').update(payload).eq('id',data.id).eq('creator_id',user.id).select().single();
      if (error) throw sbErr(error); return r;
    } else {
      const { data:r, error } = await sb.from('products').insert(payload).select().single();
      if (error) throw sbErr(error); return r;
    }
  },

  async deleteProduct(id) {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return;
    const { data:p } = await sb.from('products').select('file_size').eq('id',id).single();
    if (p?.file_size > 0) await NzimboAuth.freeStorage(p.file_size);
    await sb.from('products').delete().eq('id',id).eq('creator_id',user.id);
  },

  /* ─── UPLOAD DE FICHEIROS ─────────────────────────────── */

  async uploadFile(bucket, path, file) {
    const sb = await waitSB();
    // Verificar quota
    await NzimboAuth.useStorage(file.size);
    const { data, error } = await sb.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { await NzimboAuth.freeStorage(file.size); throw new Error('Erro no upload: ' + error.message); }
    const { data: urlData } = sb.storage.from(bucket).getPublicUrl(data.path);
    return { url: urlData.publicUrl, size: file.size, path: data.path };
  },

  async deleteFile(bucket, path, fileSize) {
    const sb = await waitSB();
    await sb.storage.from(bucket).remove([path]);
    if (fileSize > 0) await NzimboAuth.freeStorage(fileSize);
  },

  /* ─── STATS DA HOME ───────────────────────────────────── */

  async getPublicStats() {
    const sb = await waitSB();
    const { data } = await sb.from('public_stats').select('*').single();
    return data || {};
  },

  /* ─── WISHLIST ────────────────────────────────────────── */
  async addWishlist(courseId, productId) {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return;
    await sb.from('wishlist').upsert({ user_id:user.id, course_id:courseId||null, product_id:productId||null });
  },

  async getWishlist() {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return [];
    const { data } = await sb.from('wishlist').select('*, courses(id,title,price,category), products(id,title,price,category)').eq('user_id',user.id);
    return data||[];
  },

  /* ─── NOTAS ───────────────────────────────────────────── */
  async saveNote(courseId, content) {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return;
    await sb.from('notes').upsert({ user_id:user.id, course_id:courseId, content, updated_at:new Date().toISOString() }, { onConflict:'user_id,course_id' });
  },

  async getNote(courseId) {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return '';
    const { data } = await sb.from('notes').select('content').eq('user_id',user.id).eq('course_id',courseId).maybeSingle();
    return data?.content || '';
  },

  /* ─── PURCHASES (simulado - integrar gateway real) ───── */
  async recordPurchase({ courseId, productId, amount, method }) {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return;
    await sb.from('purchases').insert({
      user_id: user.id, course_id: courseId||null,
      product_id: productId||null, amount, method: method||'Multicaixa', status:'paid'
    });
    // Auto-enroll se for curso
    if (courseId) await this.enrollCourse(courseId);
  },

  async getPurchaseHistory() {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return [];
    const { data } = await sb.from('purchases')
      .select('*, courses(title), products(title)')
      .eq('user_id',user.id)
      .order('purchased_at',{ascending:false});
    return data||[];
  },

  /* ─── CRIADOR: STATS ──────────────────────────────────── */
  async getCreatorStats() {
    const sb = await waitSB();
    const user = await NzimboAuth.getUser();
    if (!user) return {};
    const [{ count: tc }, { count: tp }, { data: purchases }] = await Promise.all([
      sb.from('courses').select('id',{count:'exact',head:true}).eq('creator_id',user.id).eq('status','published'),
      sb.from('products').select('id',{count:'exact',head:true}).eq('creator_id',user.id).eq('status','published'),
      sb.from('purchases').select('amount').in('course_id',
        (await sb.from('courses').select('id').eq('creator_id',user.id)).data?.map(c=>c.id)||[]
      )
    ]);
    const revenue = (purchases||[]).reduce((s,p)=>s+(p.amount||0),0);
    return { totalCourses:tc||0, totalProducts:tp||0, totalRevenue:revenue };
  }
};

window.NzimboCourses = NzimboCourses;
