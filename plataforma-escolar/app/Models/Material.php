<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Material extends Model
{
    use HasFactory, SoftDeletes;
     protected $table = 'materiais';

    const TIPO_PDF    = 'pdf';
    const TIPO_IMAGEM = 'imagem';
    const TIPO_VIDEO  = 'video';
    const TIPO_LINK   = 'link';
    const TIPO_OUTRO  = 'outro';

    protected $fillable = [
        'sala_id',
        'autor_id',
        'titulo',
        'descricao',
        'tipo',           // pdf | imagem | video | link | outro
        'caminho_ficheiro', // path no storage (para uploads)
        'url_externa',    // URL (para links externos / vídeos)
        'tamanho_bytes',
        'nome_original',
    ];

    protected $appends = ['url_download'];

    // ─────────────────────────────────────────────
    // Relacionamentos
    // ─────────────────────────────────────────────

    public function sala()
    {
        return $this->belongsTo(Sala::class);
    }

    public function autor()
    {
        return $this->belongsTo(User::class, 'autor_id');
    }

    // ─────────────────────────────────────────────
    // Accessors
    // ─────────────────────────────────────────────

    public function getUrlDownloadAttribute(): ?string
    {
        if ($this->caminho_ficheiro) {
            return Storage::disk('public')->url($this->caminho_ficheiro);
        }
        return $this->url_externa;
    }
}
