import { apiRequest } from '@/lib/apiClient'
import type { GlobalSearchResult } from './types'

// FIX: Define a strict interface for the raw Frappe search response 
// to completely eliminate the need for the `any` keyword.
interface RawSearchResult {
  title?: string
  name?: string
  value?: string
  description?: string
  subtitle?: string
  doctype?: string
  type?: string
}

export async function searchGlobal(query: string): Promise<GlobalSearchResult[]> {
  const encoded = encodeURIComponent(query)
  
  // FIX: Replaced Record<string, any> with our strict RawSearchResult[] interface
  const res = await apiRequest<{ message?: { results?: RawSearchResult[] } }>(
    `/method/frappe.utils.global_search.search?text=${encoded}&limit=20`
  )
  
  const rawResults = res.message?.results ?? []
  
  return rawResults.map((item) => ({
    title: item.title ?? item.name ?? item.value ?? 'Untitled',
    description: item.description ?? item.subtitle ?? '',
    doctype: item.doctype ?? item.type ?? 'Unknown',
    name: item.name ?? item.value ?? '',
  }))
}