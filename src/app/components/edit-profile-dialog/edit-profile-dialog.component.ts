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

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Editar Perfil</h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="edit-form" style="display: flex; flex-direction: column; gap: 10px; min-width: 300px;">

        <mat-form-field appearance="outline">
          <mat-label>Nome Completo</mat-label>
          <input matInput formControlName="nome">
          <mat-error *ngIf="checkError('nome', 'required')">Nome é obrigatório</mat-error>
        </mat-form-field>

        <h3 style="font-size: 1rem; color: #666; margin: 10px 0;">Alterar Senha (Opcional)</h3>

        <mat-form-field appearance="outline">
          <mat-label>Nova Senha</mat-label>
          <input matInput formControlName="senha" type="password">
          <mat-error *ngIf="checkError('senha', 'minlength')">Mínimo 6 caracteres</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Confirmar Nova Senha</mat-label>
          <input matInput formControlName="confirmarSenha" type="password">
          <mat-error *ngIf="form.errors?.['passwordMismatch']">As senhas não coincidem</mat-error>
        </mat-form-field>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="onSave()">Salvar</button>
    </mat-dialog-actions>
  `
})
export class EditProfileDialogComponent {
  form: FormGroup;

  // Validador de senha
  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const senha = control.get('senha')?.value;
    const confirmarSenha = control.get('confirmarSenha')?.value;

    if (!senha || !confirmarSenha) {
      return null;
    }

    return senha === confirmarSenha ? null : { passwordMismatch: true };
  }

  constructor(
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nome: string }
  ) {
    // Inicialização manual do FormGroup (Resolve erro de depreciação do FormBuilder)
    this.form = new FormGroup({
      nome: new FormControl(data.nome || '', [Validators.required]),
      senha: new FormControl('', [Validators.minLength(6)]),
      confirmarSenha: new FormControl('')
    }, { validators: this.passwordMatchValidator });
  }

  checkError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    // Verifica se o controle existe e tem o erro especificado
    return control ? control.hasError(errorName) : false;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
