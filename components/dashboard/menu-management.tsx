"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react"
import { motion } from "framer-motion"

interface Category {
  id: string
  name: string
  description: string
  display_order: number
  created_at: string
  image_url: string | null
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category_id: string
  available: boolean
  created_at: string
}

export function MenuManagement() {
  const supabase = createClient()

  // --- States ---
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [activeTab, setActiveTab] = useState<"categories" | "products">("categories")
  const [isLoading, setIsLoading] = useState(true)

  // Category form
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", display_order: 0, image_url: "" })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)

  // Product form
  const [productForm, setProductForm] = useState({ name: "", description: "", price: 0, image_url: "", category_id: "", available: true })
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)

  // --- Fetch data ---
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        supabase.from("categories").select("*").order("display_order", { ascending: true }),
        supabase.from("products").select("*").order("name", { ascending: true }),
      ])
      if (categoriesRes.data) setCategories(categoriesRes.data)
      if (productsRes.data) setProducts(productsRes.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // --- Upload category image ---
  const uploadCategoryImage = async (): Promise<string | null> => {
    if (!imageFile) return null
    const fileName = `${Date.now()}-${imageFile.name}`
    try {
      const { data, error } = await supabase.storage.from("category-icons").upload(fileName, imageFile, { cacheControl: "3600", upsert: true })
      if (error) throw error
      const { data: urlData, error: urlError } = supabase.storage.from("category-icons").getPublicUrl(fileName)
      if (urlError) throw urlError
      return urlData.publicUrl
    } catch (err: any) {
      console.error("Error uploading image:", err)
      alert("Failed to upload image")
      return null
    }
  }

  // --- Save category ---
  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) return
    let uploadedImageUrl = categoryForm.image_url
    if (imageFile) {
      uploadedImageUrl = await uploadCategoryImage()
      if (!uploadedImageUrl) return
    }
    const payload = { ...categoryForm, image_url: uploadedImageUrl }
    try {
      if (editingCategory) {
        const { error } = await supabase.from("categories").update(payload).eq("id", editingCategory)
        if (error) throw error
        setCategories(categories.map(c => c.id === editingCategory ? { ...c, ...payload } : c))
      } else {
        const { data, error } = await supabase.from("categories").insert([payload]).select()
        if (error) throw error
        if (data) setCategories([...categories, data[0]])
      }
      setCategoryForm({ name: "", description: "", display_order: 0, image_url: "" })
      setImageFile(null)
      setEditingCategory(null)
      setShowCategoryForm(false)
    } catch (err) {
      console.error(err)
      alert("Failed to save category")
    }
  }

  // --- Delete category ---
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return
    try {
      const { error } = await supabase.from("categories").delete().eq("id", id)
      if (error) throw error
      setCategories(categories.filter(c => c.id !== id))
    } catch (err) {
      console.error(err)
      alert("Failed to delete category")
    }
  }

  const handleEditCategory = (category: Category) => {
    setCategoryForm({
      name: category.name,
      description: category.description,
      display_order: category.display_order,
      image_url: category.image_url || ""
    })
    setEditingCategory(category.id)
    setShowCategoryForm(true)
  }

  // --- Save product ---
  const handleSaveProduct = async () => {
    if (!productForm.name.trim() || !productForm.category_id) return alert("Enter name and category")
    try {
      if (editingProduct) {
        const { error } = await supabase.from("products").update(productForm).eq("id", editingProduct)
        if (error) throw error
        setProducts(products.map(p => p.id === editingProduct ? { ...p, ...productForm } : p))
      } else {
        const { data, error } = await supabase.from("products").insert([productForm]).select()
        if (error) throw error
        if (data) setProducts([...products, data[0]])
      }
      setProductForm({ name: "", description: "", price: 0, image_url: "", category_id: "", available: true })
      setEditingProduct(null)
      setShowProductForm(false)
    } catch (err) {
      console.error(err)
      alert("Failed to save product")
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return
    try {
      const { error } = await supabase.from("products").delete().eq("id", id)
      if (error) throw error
      setProducts(products.filter(p => p.id !== id))
    } catch (err) {
      console.error(err)
      alert("Failed to delete product")
    }
  }

  const handleEditProduct = (product: Product) => {
    setProductForm({ ...product })
    setEditingProduct(product.id)
    setShowProductForm(true)
  }

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "Unknown"

  // --- Loading ---
  if (isLoading) return <div className="py-12 text-center text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button onClick={() => setActiveTab("categories")} className={`px-4 py-2 font-medium ${activeTab === "categories" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Categories ({categories.length})</button>
        <button onClick={() => setActiveTab("products")} className={`px-4 py-2 font-medium ${activeTab === "products" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>Products ({products.length})</button>
      </div>

      {/* Categories */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Menu Categories</h2>
            <Button onClick={() => setShowCategoryForm(true)} className="gap-2"><Plus className="w-4 h-4"/> Add Category</Button>
          </div>
          {showCategoryForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 bg-muted border-2 border-primary space-y-4">
                <input type="text" placeholder="Category name" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} className="w-full border px-3 py-2 rounded"/>
                <textarea placeholder="Description" value={categoryForm.description} onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })} className="w-full border px-3 py-2 rounded" rows={3}/>
                <input type="number" placeholder="Display order" value={categoryForm.display_order} onChange={e => setCategoryForm({ ...categoryForm, display_order: Number(e.target.value) })} className="w-full border px-3 py-2 rounded"/>
                
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border rounded-md">
                    <ImageIcon className="w-4 h-4"/>
                    Upload Icon
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setImageFile(file)
                        setCategoryForm(prev => ({ ...prev, image_url: URL.createObjectURL(file) }))
                      }
                    }}/>
                  </label>
                  {categoryForm.image_url && <img src={categoryForm.image_url} className="w-12 h-12 rounded object-cover border"/>}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveCategory} className="flex-1">{editingCategory ? "Update" : "Create"} Category</Button>
                  <Button variant="outline" onClick={() => { setShowCategoryForm(false); setEditingCategory(null); setImageFile(null); setCategoryForm({ name: "", description: "", display_order: 0, image_url: "" }) }}>Cancel</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Category List */}
          <div className="grid gap-3">
            {categories.map(c => (
              <Card key={c.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {c.image_url ? <img src={c.image_url} className="w-12 h-12 rounded object-cover border"/> : <div className="w-12 h-12 bg-muted flex items-center justify-center rounded"><ImageIcon className="w-5 h-5"/></div>}
                  <div>
                    <h3 className="font-bold">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">{c.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditCategory(c)}><Edit2 className="w-4 h-4"/></Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteCategory(c.id)}><Trash2 className="w-4 h-4"/></Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Menu Items</h2>
            <Button onClick={() => setShowProductForm(true)} className="gap-2"><Plus className="w-4 h-4"/> Add Product</Button>
          </div>

          {showProductForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 bg-muted border-2 border-primary space-y-4">
                <input type="text" placeholder="Name" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full border px-3 py-2 rounded"/>
                <textarea placeholder="Description" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} className="w-full border px-3 py-2 rounded" rows={2}/>
                <input type="number" placeholder="Price" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })} className="w-full border px-3 py-2 rounded"/>
                <input type="url" placeholder="Image URL" value={productForm.image_url} onChange={e => setProductForm({ ...productForm, image_url: e.target.value })} className="w-full border px-3 py-2 rounded"/>
                <select value={productForm.category_id} onChange={e => setProductForm({ ...productForm, category_id: e.target.value })} className="w-full border px-3 py-2 rounded">
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={productForm.available} onChange={e => setProductForm({ ...productForm, available: e.target.checked })} className="w-4 h-4"/>
                  <label>Available</label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveProduct} className="flex-1">{editingProduct ? "Update" : "Create"} Product</Button>
                  <Button variant="outline" onClick={() => { setShowProductForm(false); setEditingProduct(null); setProductForm({ name: "", description: "", price: 0, image_url: "", category_id: "", available: true }) }}>Cancel</Button>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Product List */}
          <div className="grid gap-3">
            {products.map(p => (
              <Card key={p.id} className="p-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold">{p.name}</h3>
                    <Badge variant={p.available ? "default" : "secondary"}>{p.available ? "Available" : "Unavailable"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline">{getCategoryName(p.category_id)}</Badge>
                    <Badge variant="outline">{p.price.toFixed(2)} د.ت</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditProduct(p)}><Edit2 className="w-4 h-4"/></Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="w-4 h-4"/></Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
