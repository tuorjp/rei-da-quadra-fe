import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './edit-profile-dialog.component.html',
  styleUrls: ['./edit-profile-dialog.component.css']
})
export class EditProfileDialogComponent {
  form: FormGroup;
  previewPhoto: string | null = null; // Armazena a prévia da foto selecionada
  photoChanged = false; // Indica se a foto foi alterada

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const senha = control.get('senha')?.value;
    const confirmarSenha = control.get('confirmarSenha')?.value;
    if (!senha || !confirmarSenha) return null;
    return senha === confirmarSenha ? null : { passwordMismatch: true };
  }

  constructor(
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nome: string, currentPhoto: string | null }
  ) {
    // Inicializa a prévia com a foto atual vinda do perfil
    this.previewPhoto = data.currentPhoto;

    this.form = new FormGroup({
      nome: new FormControl(data.nome || '', [Validators.required]),
      senha: new FormControl('', [Validators.minLength(6)]),
      confirmarSenha: new FormControl('')
    }, { validators: this.passwordMatchValidator });
  }

  checkError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return control ? control.hasError(errorName) : false;
  }

  // LÓGICA DE FOTO

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validação simples de tamanho (opcional)
      if (file.size > 2 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 2MB.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        // Converte para Base64 para exibição e envio
        this.previewPhoto = reader.result as string;
        this.photoChanged = true;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto(): void {
    this.previewPhoto = null;
    this.photoChanged = true;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      const result = {
        ...this.form.value,
        // Se a foto mudou, envia a nova string (ou "" se foi removida).
        // Se não mudou, manda undefined para o ProfileComponent ignorar este campo.
        fotoPerfil: this.photoChanged ? (this.previewPhoto || "") : undefined
      };

      this.dialogRef.close(result);
    }
  }
}
