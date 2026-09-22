import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ProductRelationship } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/security";

async function requireSession() {
  const session = verifySession((await cookies()).get("aslal_session")?.value);
  if (!session) redirect("/login");
  return session;
}

function value(formData: FormData, name: string, max: number) {
  return String(formData.get(name) || "").trim().slice(0, max);
}

async function createProduct(formData: FormData) {
  "use server";
  await requireSession();
  const slug = value(formData, "slug", 160).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  const name = value(formData, "name", 190);
  const providerName = value(formData, "providerName", 190) || null;
  const relationshipType = value(formData, "relationshipType", 40) as ProductRelationship;
  const shortDescription = value(formData, "shortDescription", 500);
  const description = value(formData, "description", 5000) || null;
  const startingPrice = value(formData, "startingPrice", 100) || null;
  if (!slug || !name || !shortDescription || !Object.values(ProductRelationship).includes(relationshipType)) return;
  await prisma.product.create({
    data: {
      id: crypto.randomUUID(),
      slug,
      name,
      providerName,
      relationshipType,
      shortDescription,
      description,
      startingPrice,
      featured: formData.get("featured") === "on",
      active: formData.get("active") === "on",
    },
  });
  revalidatePath("/dashboard/products");
  revalidatePath("/contact");
}

async function updateProduct(formData: FormData) {
  "use server";
  await requireSession();
  const id = value(formData, "id", 36);
  const name = value(formData, "name", 190);
  const providerName = value(formData, "providerName", 190) || null;
  const relationshipType = value(formData, "relationshipType", 40) as ProductRelationship;
  const shortDescription = value(formData, "shortDescription", 500);
  const description = value(formData, "description", 5000) || null;
  const startingPrice = value(formData, "startingPrice", 100) || null;
  if (!id || !name || !shortDescription || !Object.values(ProductRelationship).includes(relationshipType)) return;
  await prisma.product.update({
    where: { id },
    data: {
      name,
      providerName,
      relationshipType,
      shortDescription,
      description,
      startingPrice,
      featured: formData.get("featured") === "on",
      active: formData.get("active") === "on",
    },
  });
  revalidatePath("/dashboard/products");
  revalidatePath("/contact");
}

const relationships = Object.values(ProductRelationship);

export default async function ProductsAdminPage() {
  const session = await requireSession();
  const products = await prisma.product.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] });

  return (
    <main className="min-h-screen bg-[#F8FAFC] py-10 text-[#1E293B]">
      <div className="container-aslal">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-black uppercase tracking-[.2em] text-[#0F3E8A]">Growth OS / Catalog</div>
            <h1 className="mt-2 text-4xl font-black tracking-tight">Solutions & services</h1>
            <p className="mt-2 max-w-3xl text-slate-500">Manage the active solutions shown in the public contact form. Changes are reflected there without editing code.</p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500">{session.email}</span>
            <a href="/dashboard" className="rounded-full bg-[#0F3E8A] px-5 py-3 text-sm font-black text-white">← Dashboard</a>
          </div>
        </div>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="text-xs font-black uppercase tracking-[.16em] text-[#0F3E8A]">Add solution</div>
          <h2 className="mt-2 text-2xl font-black">Create a new service option</h2>
          <form action={createProduct} className="mt-6 grid gap-4 lg:grid-cols-2">
            <Field label="Name" name="name" placeholder="SEO Growth" required />
            <Field label="Slug" name="slug" placeholder="seo-growth" required />
            <Field label="Provider" name="providerName" placeholder="Aslal Digital Solutions" />
            <label className="text-sm font-bold text-slate-700">Relationship
              <select name="relationshipType" defaultValue="OWNED" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3">{relationships.map(x => <option key={x}>{x}</option>)}</select>
            </label>
            <Field label="Short description" name="shortDescription" placeholder="What this solution does" required />
            <Field label="Starting price" name="startingPrice" placeholder="Request quote" />
            <label className="text-sm font-bold text-slate-700 lg:col-span-2">Description
              <textarea name="description" rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3" />
            </label>
            <div className="flex flex-wrap gap-5 text-sm font-bold"><label><input type="checkbox" name="active" defaultChecked className="mr-2" />Active / visible in contact form</label><label><input type="checkbox" name="featured" className="mr-2" />Featured</label></div>
            <button className="w-fit rounded-full bg-[#0F3E8A] px-6 py-3 font-black text-white">Add solution</button>
          </form>
        </section>

        <section className="mt-8 space-y-5">
          {products.map(product => (
            <form key={product.id} action={updateProduct} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
              <input type="hidden" name="id" value={product.id} />
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <div className="text-xs font-black uppercase tracking-[.14em] text-[#0F3E8A]">{product.slug}</div>
                  <h2 className="mt-1 text-2xl font-black">{product.name}</h2>
                </div>
                <span className={product.active ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700" : "rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500"}>{product.active ? "ACTIVE" : "HIDDEN"}</span>
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <Field label="Name" name="name" defaultValue={product.name} required />
                <Field label="Provider" name="providerName" defaultValue={product.providerName || ""} />
                <label className="text-sm font-bold text-slate-700">Relationship
                  <select name="relationshipType" defaultValue={product.relationshipType} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3">{relationships.map(x => <option key={x}>{x}</option>)}</select>
                </label>
                <Field label="Starting price" name="startingPrice" defaultValue={product.startingPrice || ""} />
                <Field label="Short description" name="shortDescription" defaultValue={product.shortDescription} required />
                <label className="text-sm font-bold text-slate-700 lg:col-span-2">Description
                  <textarea name="description" rows={3} defaultValue={product.description || ""} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3" />
                </label>
                <div className="flex flex-wrap gap-5 text-sm font-bold"><label><input type="checkbox" name="active" defaultChecked={product.active} className="mr-2" />Active / visible in contact form</label><label><input type="checkbox" name="featured" defaultChecked={product.featured} className="mr-2" />Featured</label></div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-4">
                <span className="text-xs text-slate-400">Slug: {product.slug}</span>
                <button className="rounded-full bg-[#0F3E8A] px-6 py-3 font-black text-white">Save changes</button>
              </div>
            </form>
          ))}
          {!products.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">No solutions yet. Add the first one above.</div>}
        </section>
      </div>
    </main>
  );
}

function Field({ label, name, placeholder, defaultValue, required = false }: { label: string; name: string; placeholder?: string; defaultValue?: string; required?: boolean }) {
  return <label className="text-sm font-bold text-slate-700">{label}<input name={name} placeholder={placeholder} defaultValue={defaultValue} required={required} maxLength={name === "shortDescription" ? 500 : undefined} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3" /></label>;
}
