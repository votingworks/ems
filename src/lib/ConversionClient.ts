export interface VxFile {
  name: string
  path: string
}

export interface VxFiles {
  inputFiles: VxFile[]
  outputFiles: VxFile[]
}

export default class ConversionClient {
  private readonly baseURL: string
  private readonly id: string

  public constructor(baseURL: string, id: string) {
    this.baseURL = baseURL
    this.id = id
  }

  public async setInputFile(name: string, content: File): Promise<void> {
    const formData = new FormData()
    formData.append('file', content)
    formData.append('name', name)

    const response = await fetch(this.url('submitfile'), {
      method: 'POST',
      body: formData,
    })
    const result = await response.json()

    if (result.status !== 'ok') {
      throw new Error(
        `failed to upload file named "${name}": ${JSON.stringify(result)}`
      )
    }
  }

  public async process(): Promise<void> {
    const response = await fetch(this.url('process'), { method: 'POST' })
    const result = await response.json()

    if (result.status !== 'ok') {
      throw new Error(`failed to process files: ${JSON.stringify(result)}`)
    }
  }

  public async getOutputFile(name: string): Promise<Blob> {
    const response = await fetch(
      this.url(`output?name=${encodeURIComponent(name)}`),
      { cache: 'no-store' }
    )
    return await response.blob()
  }

  public async getFiles(): Promise<VxFiles> {
    const response = await fetch(this.url('files'), { cache: 'no-store' })
    return await response.json()
  }

  private url(path: string): string {
    if (path.startsWith('/')) {
      return `${this.baseURL}${path}`
    }

    return `${this.baseURL}/${this.id}/${path}`
  }

  private async assertInputFileExistsWithName(name: string): Promise<void> {
    const files = await this.getFiles()

    if (files.inputFiles.every(file => file.name !== name)) {
      throw new Error(`no input file found with name "${name}"`)
    }
  }

  public async reset(): Promise<void> {
    await fetch(this.url('/reset'), { method: 'POST' })
  }
}
