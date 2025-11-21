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

export function MenuManagement() {
  const [categories, setCategories] = useState<Category[]>([])
  const [activeTab, setActiveTab] = useState<"categories" | "products">("categories")
  const [isLoading, setIsLoading] = useState(true)

  // Category form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    display_order: 0,
    image_url: ""
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch categories
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true })
      if (error) throw error
      if (data) setCategories(data)
    } catch (error) {
      console.error("Error fetching categories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Upload image to bucket
  const uploadCategoryImage = async () => {
    if (!imageFile) return categoryForm.image_url || null

    const fileName = `${Date.now()}-${imageFile.name}`

    const { data, error } = await supabase.storage
      .from("category-icons")
      .upload(fileName, imageFile, { cacheControl: "3600", upsert: true })

    if (error) {
      console.error("Image upload error:", error)
      return null
    }

    const { data: urlData, error: urlError } = supabase.storage
      .from("category-icons")
      .getPublicUrl(fileName)

    if (urlError) {
      console.error("Error getting public URL:", urlError)
      return null
    }

    return urlData.publicUrl
  }

  // Save or update category
  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) return

    try {
      const uploadedImageUrl = await uploadCategoryImage()

      const payload = { 
        name: categoryForm.name,
        description: categoryForm.description,
        display_order: categoryForm.display_order,
        image_url: uploadedImageUrl
      }

      if (editingCategory) {
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", editingCategory)
        if (error) throw error

        setCategories(categories.map(c => c.id === editingCategory ? { ...c, ...payload } : c))
        setMessage("Category updated successfully!")
      } else {
        const { data, error } = await supabase.from("categories").insert([payload]).select()
        if (error) throw error
        if (data) setCategories([...categories, data[0]])
        setMessage("Category created successfully!")
      }

      // Reset form
      setCategoryForm({ name: "", description: "", display_order: 0, image_url: "" })
      setImageFile(null)
      setEditingCategory(null)
      setShowCategoryForm(false)

      // Remove message after 3s
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error("Error saving category:", error)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const { error } = await supabase.from("categories").delete().eq("id", categoryId)
      if (error) throw error
      setCategories(categories.filter(c => c.id !== categoryId))
      setMessage("Category deleted successfully!")
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error("Error deleting category:", error)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-bounce">☕</div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success message */}
      {message && (
        <div className="p-4 bg-green-200 text-green-800 rounded">{message}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "categories" ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Categories ({categories.length})
        </button>
      </div>

      {/* Categories */}
      {activeTab === "categories" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Menu Categories</h2>
            <Button onClick={() => setShowCategoryForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </div>

          {/* Category Form */}
          {showCategoryForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 bg-muted border-2 border-primary">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Category name"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  />
                  <textarea
                    placeholder="Category description"
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                    rows={3}
                  />
                  <input
                    type="number"
                    placeholder="Display order"
                    value={categoryForm.display_order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, display_order: Number.parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  />

                  {/* Image Upload */}
                  <div>
                    <label className="text-sm font-medium">Category Icon</label>
                    <div className="flex items-center gap-3 mt-2">
                      <label className="cursor-pointer flex items-center gap-2 px-3 py-2 border rounded-md">
                        <ImageIcon className="w-4 h-4" />
                        <span>Upload Icon</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              setImageFile(file)
                              setCategoryForm(prev => ({
                                ...prev,
                                image_url: URL.createObjectURL(file)
                              }))
                            }
                          }}
                        />
                      </label>
                      {categoryForm.image_url && (
                        <img src={categoryForm.image_url} className="w-12 h-12 rounded object-cover border" />
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveCategory} className="flex-1">
                      {editingCategory ? "Update" : "Create"} Category
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCategoryForm(false)
                        setEditingCategory(null)
                        setImageFile(null)
                        setCategoryForm({ name: "", description: "", display_order: 0, image_url: "" })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Category List */}
          <div className="grid gap-3">
            {categories.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">No categories yet</Card>
            ) : (
              categories.map(category => (
                <motion.div key={category.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 justify-between">
                      <div className="flex items-center gap-3">
                        {category.image_url ? (
                          <img src={category.image_url} className="w-12 h-12 rounded object-cover border" />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-lg">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditCategory(category)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteCategory(category.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

     
      {/* Products */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Menu Items</h2>
            <Button onClick={() => setShowProductForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>

          {/* Product Form */}
          {showProductForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 bg-muted border-2 border-primary">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Product name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  />
                  <textarea
                    placeholder="Product description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                    rows={2}
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Price (TND)"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number.parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={productForm.image_url}
                    onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  />
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-md"
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="available"
                      checked={productForm.available}
                      onChange={(e) => setProductForm({ ...productForm, available: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="available" className="text-sm font-medium">
                      Available for order
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSaveProduct} className="flex-1">
                      {editingProduct ? "Update" : "Create"} Product
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowProductForm(false)
                        setEditingProduct(null)
                        setProductForm({
                          name: "",
                          description: "",
                          price: 0,
                          image_url: "",
                          category_id: "",
                          available: true,
                        })
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Product List */}
          <div className="grid gap-3">
            {products.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">No products yet</Card>
            ) : (
              products.map(product => (
                <motion.div key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-lg">{product.name}</h3>
                          <Badge variant={product.available ? "default" : "secondary"}>
                            {product.available ? "Available" : "Unavailable"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline">{getCategoryName(product.category_id)}</Badge>
                          <Badge variant="outline" className="font-bold">{product.price.toFixed(2)} د.ت</Badge>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleEditProduct(product)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteProduct(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
