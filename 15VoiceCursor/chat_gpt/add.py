def add(*args):
    return sum(args)

def subtract(a, b):
    return a - b

def multiply(*args):
    result = 1
    for num in args:
        result *= num
    return result

def divide(a, b):
    if b == 0:
        return 'Error: Division by zero'
    return a / b

if __name__ == "__main__":
    print("Select operation:")
    print("1. Add")
    print("2. Subtract")
    print("3. Multiply")
    print("4. Divide")
    choice = input("Enter choice (1/2/3/4): ")

    if choice == '1':
        n = int(input("How many numbers do you want to add? "))
        numbers = [float(input(f"Enter number {i+1}: ")) for i in range(n)]
        print("Sum:", add(*numbers))
    elif choice == '2':
        a = float(input("Enter first number: "))
        b = float(input("Enter second number: "))
        print("Difference:", subtract(a, b))
    elif choice == '3':
        n = int(input("How many numbers do you want to multiply? "))
        numbers = [float(input(f"Enter number {i+1}: ")) for i in range(n)]
        print("Product:", multiply(*numbers))
    elif choice == '4':
        a = float(input("Enter numerator: "))
        b = float(input("Enter denominator: "))
        print("Quotient:", divide(a, b))
    else:
        print("Invalid choice!")
